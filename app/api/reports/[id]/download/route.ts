import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { db } from '@/db';
import { reports, tripInspections, snowRemovals, attendance, users, zones } from '@/db/schema';
import { requireAuth } from '@/lib/utils/session';
import { eq, and, gte, lte } from 'drizzle-orm';

function fmt(d: Date | string | null | undefined): string {
    if (!d) return '';
    return new Date(d as string).toLocaleString('en-CA', { hour12: false });
}

// GET /api/reports/:id/download
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAuth();
        const { id } = await params;

        const report = await db.query.reports.findFirst({
            where: eq(reports.reportId, id),
        });

        if (!report) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        const dateFrom = report.dateRangeStart ? new Date(report.dateRangeStart) : null;
        const dateTo = report.dateRangeEnd ? new Date(`${report.dateRangeEnd}T23:59:59`) : null;

        let sheetData: Record<string, unknown>[] = [];

        if (report.type === 'trip') {
            const query = db
                .select({
                    tripId: tripInspections.tripId,
                    zone: zones.name,
                    zoneType: tripInspections.zoneType,
                    status: tripInspections.status,
                    streetName: tripInspections.streetName,
                    avenueName: tripInspections.avenueName,
                    highPoint: tripInspections.highPoint,
                    lowPoint: tripInspections.lowPoint,
                    length: tripInspections.length,
                    capturedLat: tripInspections.capturedLatitude,
                    capturedLng: tripInspections.capturedLongitude,
                    notes: tripInspections.notes,
                    inspectedAt: tripInspections.inspectedAt,
                    completedAt: tripInspections.completedAt,
                    createdAt: tripInspections.createdAt,
                })
                .from(tripInspections)
                .leftJoin(zones, eq(tripInspections.zoneId, zones.id));

            const conditions = [];
            if (dateFrom) conditions.push(gte(tripInspections.createdAt, dateFrom));
            if (dateTo)   conditions.push(lte(tripInspections.createdAt, dateTo));
            if (report.relatedId) conditions.push(eq(tripInspections.tripId, report.relatedId));

            const rows = conditions.length ? await query.where(and(...conditions)) : await query;

            sheetData = rows.map(r => ({
                'Trip ID':          r.tripId,
                'Zone':             r.zone ?? '',
                'Zone Type':        r.zoneType,
                'Status':           r.status,
                'Street Name':      r.streetName ?? '',
                'Avenue / Cross':   r.avenueName ?? '',
                'High Point (cm)':  r.highPoint ?? '',
                'Low Point (cm)':   r.lowPoint ?? '',
                'Length (m)':       r.length ?? '',
                'Latitude':         r.capturedLat ?? '',
                'Longitude':        r.capturedLng ?? '',
                'Notes':            r.notes ?? '',
                'Inspected At':     fmt(r.inspectedAt),
                'Completed At':     fmt(r.completedAt),
                'Created At':       fmt(r.createdAt),
            }));

        } else if (report.type === 'snow') {
            const query = db
                .select({
                    snowId: snowRemovals.snowId,
                    zone: zones.name,
                    zoneType: snowRemovals.zoneType,
                    status: snowRemovals.status,
                    streetName: snowRemovals.streetName,
                    avenueName: snowRemovals.avenueName,
                    highPoint: snowRemovals.highPoint,
                    lowPoint: snowRemovals.lowPoint,
                    length: snowRemovals.length,
                    capturedLat: snowRemovals.capturedLatitude,
                    capturedLng: snowRemovals.capturedLongitude,
                    notes: snowRemovals.notes,
                    inspectedAt: snowRemovals.inspectedAt,
                    completedAt: snowRemovals.completedAt,
                    createdAt: snowRemovals.createdAt,
                })
                .from(snowRemovals)
                .leftJoin(zones, eq(snowRemovals.zoneId, zones.id));

            const conditions = [];
            if (dateFrom) conditions.push(gte(snowRemovals.createdAt, dateFrom));
            if (dateTo)   conditions.push(lte(snowRemovals.createdAt, dateTo));
            if (report.relatedId) conditions.push(eq(snowRemovals.snowId, report.relatedId));

            const rows = conditions.length ? await query.where(and(...conditions)) : await query;

            sheetData = rows.map(r => ({
                'Snow ID':          r.snowId,
                'Zone':             r.zone ?? '',
                'Zone Type':        r.zoneType,
                'Status':           r.status,
                'Street Name':      r.streetName ?? '',
                'Avenue / Cross':   r.avenueName ?? '',
                'High Point (cm)':  r.highPoint ?? '',
                'Low Point (cm)':   r.lowPoint ?? '',
                'Length (m)':       r.length ?? '',
                'Latitude':         r.capturedLat ?? '',
                'Longitude':        r.capturedLng ?? '',
                'Notes':            r.notes ?? '',
                'Inspected At':     fmt(r.inspectedAt),
                'Completed At':     fmt(r.completedAt),
                'Created At':       fmt(r.createdAt),
            }));

        } else if (report.type === 'attendance') {
            const query = db
                .select({
                    date: attendance.date,
                    fullName: users.fullName,
                    email: users.email,
                    checkIn: attendance.checkInTime,
                    checkOut: attendance.checkOutTime,
                    method: attendance.method,
                    status: attendance.status,
                    locationName: attendance.locationName,
                    createdAt: attendance.createdAt,
                })
                .from(attendance)
                .leftJoin(users, eq(attendance.userId, users.id));

            const conditions = [];
            if (dateFrom) conditions.push(gte(attendance.createdAt, dateFrom));
            if (dateTo)   conditions.push(lte(attendance.createdAt, dateTo));

            const rows = conditions.length ? await query.where(and(...conditions)) : await query;

            sheetData = rows.map(r => ({
                'Date':        r.date,
                'Name':        r.fullName ?? '',
                'Email':       r.email ?? '',
                'Check In':    r.checkIn ?? '',
                'Check Out':   r.checkOut ?? '',
                'Method':      r.method,
                'Status':      r.status,
                'Location':    r.locationName ?? '',
                'Created At':  fmt(r.createdAt),
            }));
        }

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(sheetData.length ? sheetData : [{}]);
        XLSX.utils.book_append_sheet(wb, ws, report.title.slice(0, 31));
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${report.reportId}.xlsx"`,
            },
        });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Report download error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
