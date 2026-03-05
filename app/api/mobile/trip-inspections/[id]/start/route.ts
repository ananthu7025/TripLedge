import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tripInspections, jobPhotos } from '@/db/schema';
import { requireMobileAuth } from '@/lib/utils/session';
import { logAudit } from '@/lib/utils/audit';
import { eq } from 'drizzle-orm';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireMobileAuth();
        const { id } = await params;
        const body = await request.json();

        const {
            street_name,
            avenue_name,
            high_point,
            low_point,
            length,
            captured_latitude,
            captured_longitude,
            before_photos,
        } = body;

        if (!street_name || typeof street_name !== 'string' || street_name.trim() === '') {
            return NextResponse.json({ error: 'street_name is required' }, { status: 400 });
        }

        if (!before_photos || !Array.isArray(before_photos) || before_photos.length === 0) {
            return NextResponse.json({ error: 'before_photos must be a non-empty array' }, { status: 400 });
        }

        const trip = await db.query.tripInspections.findFirst({
            where: eq(tripInspections.id, id),
        });

        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        if (trip.status !== 'pending') {
            return NextResponse.json({ error: 'Trip is already started or completed' }, { status: 400 });
        }

        await db.update(tripInspections)
            .set({
                status: 'inspected',
                inspectedBy: user.id,
                inspectedAt: new Date(),
                streetName: street_name.trim(),
                avenueName: avenue_name ? String(avenue_name).trim() : null,
                highPoint: high_point != null ? String(high_point) : null,
                lowPoint: low_point != null ? String(low_point) : null,
                length: length != null ? String(length) : null,
                capturedLatitude: captured_latitude != null ? String(captured_latitude) : null,
                capturedLongitude: captured_longitude != null ? String(captured_longitude) : null,
                updatedAt: new Date(),
            })
            .where(eq(tripInspections.id, id));

        await db.insert(jobPhotos).values(
            before_photos.map((url: string) => ({
                jobType: 'trip',
                jobId: id,
                photoType: 'before',
                photoUrl: url,
                uploadedBy: user.id,
            }))
        );

        await logAudit({
            userId: user.id,
            action: 'start_trip_inspection',
            module: 'trip_inspection',
            entityType: 'trip_inspection',
            entityId: id,
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Start trip inspection error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
