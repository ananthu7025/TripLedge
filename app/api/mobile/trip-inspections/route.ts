import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tripInspections, jobPhotos } from '@/db/schema';
import { requireMobileAuth } from '@/lib/utils/session';
import { logAudit } from '@/lib/utils/audit';
import { generateTripId } from '@/lib/utils/generators';
import { eq, or, desc } from 'drizzle-orm';

// POST /api/mobile/trip-inspections — create a trip inspection without a zone
export async function POST(request: NextRequest) {
    try {
        const user = await requireMobileAuth();
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

        const now = new Date();
        const tripId = await generateTripId();

        const [trip] = await db.insert(tripInspections).values({
            tripId,
            zoneId: null,
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
            action: 'create_trip_inspection',
            module: 'trip_inspection',
            entityType: 'trip_inspection',
            entityId: trip.id,
        });

        return NextResponse.json({ success: true, id: trip.id, tripId: trip.tripId });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Create trip inspection error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        await requireMobileAuth();

        const trips = await db.query.tripInspections.findMany({
            where: or(
                eq(tripInspections.status, 'pending'),
                eq(tripInspections.status, 'inspected'),
                eq(tripInspections.status, 'completed')
            ),
            orderBy: [desc(tripInspections.createdAt)],
            with: {
                zone: true,
            },
        });

        return NextResponse.json({ trips });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Fetch mobile trips error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
