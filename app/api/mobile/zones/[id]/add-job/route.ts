/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { zones, tripInspections, jobPhotos } from '@/db/schema';
import { requireMobileAuth } from '@/lib/utils/session';
import { logAudit } from '@/lib/utils/audit';
import { generateTripId } from '@/lib/utils/generators';
import { eq } from 'drizzle-orm';

// POST /api/mobile/zones/:id/add-job
// Technician arrives at a location and creates a trip inspection job
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireMobileAuth();
        const { id } = await params;
        const body = await request.json();

        const {
            street_name,
            house_no,
            high_point,
            low_point,
            length,
            inspected_users,
            captured_latitude,
            captured_longitude,
            before_photos,
        } = body;

        if (!street_name || typeof street_name !== 'string' || street_name.trim() === '') {
            return NextResponse.json({ error: 'street_name is required' }, { status: 400 });
        }

        const zone = await db.query.zones.findFirst({
            where: eq(zones.id, id),
        });

        const now = new Date();
        const tripId = await generateTripId();

        const [trip] = await db.insert(tripInspections).values({
            tripId,
            zoneId: zone?.id ?? null,
            status: 'inspected',
            inspectedBy: user.id,
            inspectedAt: now,
            streetName: street_name.trim(),
            houseNo: house_no ? String(house_no).trim() : null,
            highPoint: high_point != null ? String(high_point) : null,
            lowPoint: low_point != null ? String(low_point) : null,
            length: length != null ? String(length) : null,
            inspectedUsers: inspected_users && Array.isArray(inspected_users) ? JSON.stringify(inspected_users) : null,
            capturedLatitude: captured_latitude != null ? String(captured_latitude) : null,
            capturedLongitude: captured_longitude != null ? String(captured_longitude) : null,
            createdBy: user.id,
        }).returning();

        if (before_photos && Array.isArray(before_photos) && before_photos.length > 0) {
            await db.insert(jobPhotos).values(
                before_photos.map((url: string) => ({
                    jobType: 'trip',
                    jobId: trip.id,
                    photoType: 'before',
                    photoUrl: url,
                    uploadedBy: user.id,
                }))
            );
        }

        await logAudit({
            userId: user.id,
            action: 'add_trip_from_zone',
            module: 'zones',
            entityType: 'zone',
            entityId: zone?.id ?? undefined,
            metadata: { zoneName: zone?.name ?? null, tripId: trip.tripId },
        });

        return NextResponse.json({ success: true, id: trip.id, tripId: trip.tripId });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Add trip from zone error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
