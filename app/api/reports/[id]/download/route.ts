import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { db } from '@/db';
import { reports, tripInspections, snowRemovals, attendance, users, zones, jobPhotos } from '@/db/schema';
import { requireAuth } from '@/lib/utils/session';
import { eq, and, gte, lte, inArray } from 'drizzle-orm';

function fmt(d: Date | string | null | undefined): string {
    if (!d) return '';
    return new Date(d as string).toLocaleString('en-CA', { hour12: false });
}

const IMG_W = 120; // px width for embedded photos
const IMG_H = 90;  // px height for embedded photos
const ROW_H = 70;  // row height in points when photos present

async function fetchImageBuffer(url: string): Promise<{ buffer: ArrayBuffer; ext: 'jpeg' | 'png' | 'gif' } | null> {
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) return null;
        const contentType = res.headers.get('content-type') ?? '';
        const ext: 'jpeg' | 'png' | 'gif' = contentType.includes('png')
            ? 'png'
            : contentType.includes('gif')
                ? 'gif'
                : 'jpeg';
        const buf = await res.arrayBuffer();
        return { buffer: buf, ext };
    } catch {
        return null;
    }
}

type PhotoGroup = { before: string[]; after: string[] };

async function embedPhotos(
    ws: ExcelJS.Worksheet,
    wb: ExcelJS.Workbook,
    rowIndex: number,          // 1-based ExcelJS row
    beforeCol: number,         // 1-based column
    afterCol: number,
    photos: PhotoGroup,
) {
    const allUrls = [
        ...photos.before.map(u => ({ url: u, col: beforeCol })),
        ...photos.after.map(u => ({ url: u, col: afterCol })),
    ];

    if (allUrls.length === 0) return;

    ws.getRow(rowIndex).height = ROW_H;

    // Track horizontal offset per column so multiple photos sit side by side
    const offsets: Record<number, number> = {};

    for (const { url, col } of allUrls) {
        const result = await fetchImageBuffer(url);
        if (!result) continue;

        const imgId = wb.addImage({ buffer: result.buffer, extension: result.ext });
        const offset = offsets[col] ?? 0;

        ws.addImage(imgId, {
            tl: { col: col - 1 + offset * (IMG_W / 96), row: rowIndex - 1 },
            ext: { width: IMG_W, height: IMG_H },
            editAs: 'oneCell',
        });

        offsets[col] = (offsets[col] ?? 0) + 1;
    }
}

function styleHeader(ws: ExcelJS.Worksheet, colCount: number) {
    const headerRow = ws.getRow(1);
    headerRow.eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = {
            bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        };
    });
    headerRow.height = 28;

    // Auto-width for non-photo columns, wide for photo columns
    for (let i = 1; i <= colCount; i++) {
        const col = ws.getColumn(i);
        const header = String(col.header ?? '');
        if (header === 'Before Photos' || header === 'After Photos') {
            col.width = 20;
        } else {
            col.width = Math.max(header.length + 4, 14);
        }
    }
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

        const wb = new ExcelJS.Workbook();
        wb.creator = 'TripLedge';
        const ws = wb.addWorksheet(report.title.slice(0, 31));

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
        const buildPhotoUrl = (url: string) => url.startsWith('http') ? url : `${baseUrl}${url}`;

        if (report.type === 'trip' || report.type === 'snow') {
            const isTrip = report.type === 'trip';

            const query = isTrip
                ? db.select({
                    id: tripInspections.id,
                    jobId: tripInspections.tripId,
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
                }).from(tripInspections).leftJoin(zones, eq(tripInspections.zoneId, zones.id))
                : db.select({
                    id: snowRemovals.id,
                    jobId: snowRemovals.snowId,
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
                }).from(snowRemovals).leftJoin(zones, eq(snowRemovals.zoneId, zones.id));

            const conditions = [];
            if (isTrip) {
                if (dateFrom) conditions.push(gte(tripInspections.createdAt, dateFrom));
                if (dateTo)   conditions.push(lte(tripInspections.createdAt, dateTo));
                if (report.relatedId) conditions.push(eq(tripInspections.tripId, report.relatedId));
            } else {
                if (dateFrom) conditions.push(gte(snowRemovals.createdAt, dateFrom));
                if (dateTo)   conditions.push(lte(snowRemovals.createdAt, dateTo));
                if (report.relatedId) conditions.push(eq(snowRemovals.snowId, report.relatedId));
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rows = conditions.length ? await (query as any).where(and(...conditions)) : await query;

            const jobIds = rows.map((r: { id: string }) => r.id);
            const photos = jobIds.length
                ? await db.query.jobPhotos.findMany({
                    where: and(
                        eq(jobPhotos.jobType, isTrip ? 'trip' : 'snow'),
                        inArray(jobPhotos.jobId, jobIds),
                    ),
                })
                : [];

            const idLabel = isTrip ? 'Trip ID' : 'Snow ID';

            ws.columns = [
                { header: idLabel,           key: 'jobId',      width: 12 },
                { header: 'Zone',            key: 'zone',       width: 18 },
                { header: 'Zone Type',       key: 'zoneType',   width: 12 },
                { header: 'Status',          key: 'status',     width: 12 },
                { header: 'Street Name',     key: 'street',     width: 18 },
                { header: 'Avenue / Cross',  key: 'avenue',     width: 18 },
                { header: 'High Point (cm)', key: 'high',       width: 14 },
                { header: 'Low Point (cm)',  key: 'low',        width: 14 },
                { header: 'Length (m)',      key: 'length',     width: 12 },
                { header: 'Latitude',        key: 'lat',        width: 14 },
                { header: 'Longitude',       key: 'lng',        width: 14 },
                { header: 'Notes',           key: 'notes',      width: 24 },
                { header: 'Before Photos',   key: 'before',     width: 20 },
                { header: 'After Photos',    key: 'after',      width: 20 },
                { header: 'Inspected At',    key: 'inspected',  width: 20 },
                { header: 'Completed At',    key: 'completed',  width: 20 },
                { header: 'Created At',      key: 'created',    width: 20 },
            ];

            styleHeader(ws, ws.columns.length);

            const beforeColIdx = ws.columns.findIndex(c => c.key === 'before') + 1;
            const afterColIdx  = ws.columns.findIndex(c => c.key === 'after') + 1;

            for (let i = 0; i < rows.length; i++) {
                const r = rows[i];
                const rowNum = i + 2; // 1=header, data starts at 2

                ws.addRow({
                    jobId:     r.jobId,
                    zone:      r.zone ?? '',
                    zoneType:  r.zoneType,
                    status:    r.status,
                    street:    r.streetName ?? '',
                    avenue:    r.avenueName ?? '',
                    high:      r.highPoint ?? '',
                    low:       r.lowPoint ?? '',
                    length:    r.length ?? '',
                    lat:       r.capturedLat ?? '',
                    lng:       r.capturedLng ?? '',
                    notes:     r.notes ?? '',
                    before:    '',
                    after:     '',
                    inspected: fmt(r.inspectedAt),
                    completed: fmt(r.completedAt),
                    created:   fmt(r.createdAt),
                });

                const rowPhotos = photos.filter(p => p.jobId === r.id);
                const beforeUrls = rowPhotos.filter(p => p.photoType === 'before').map(p => buildPhotoUrl(p.photoUrl));
                const afterUrls  = rowPhotos.filter(p => p.photoType === 'after').map(p => buildPhotoUrl(p.photoUrl));

                if (beforeUrls.length > 0 || afterUrls.length > 0) {
                    await embedPhotos(ws, wb, rowNum, beforeColIdx, afterColIdx, {
                        before: beforeUrls,
                        after: afterUrls,
                    });
                }

                // Zebra striping
                if (i % 2 === 1) {
                    ws.getRow(rowNum).eachCell(cell => {
                        if (!cell.fill || (cell.fill as ExcelJS.FillPattern).fgColor?.argb === 'FF1E3A5F') return;
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F4FA' } };
                    });
                }
            }

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

            ws.columns = [
                { header: 'Date',       key: 'date',     width: 14 },
                { header: 'Name',       key: 'name',     width: 22 },
                { header: 'Email',      key: 'email',    width: 26 },
                { header: 'Check In',   key: 'checkIn',  width: 18 },
                { header: 'Check Out',  key: 'checkOut', width: 18 },
                { header: 'Method',     key: 'method',   width: 12 },
                { header: 'Status',     key: 'status',   width: 12 },
                { header: 'Location',   key: 'location', width: 22 },
                { header: 'Created At', key: 'created',  width: 20 },
            ];

            styleHeader(ws, ws.columns.length);

            rows.forEach((r, i) => {
                ws.addRow({
                    date:     r.date,
                    name:     r.fullName ?? '',
                    email:    r.email ?? '',
                    checkIn:  r.checkIn ?? '',
                    checkOut: r.checkOut ?? '',
                    method:   r.method,
                    status:   r.status,
                    location: r.locationName ?? '',
                    created:  fmt(r.createdAt),
                });
                if (i % 2 === 1) {
                    ws.getRow(i + 2).eachCell(cell => {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F4FA' } };
                    });
                }
            });
        }

        const buffer = await wb.xlsx.writeBuffer();

        return new NextResponse(buffer as unknown as ArrayBuffer, {
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
