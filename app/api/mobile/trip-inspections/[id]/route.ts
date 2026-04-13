import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tripInspections, jobPhotos } from '@/db/schema';
import { requireMobileAuth } from '@/lib/utils/session';
import { eq, and } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireMobileAuth();
        const { id } = await params;

        const trip = await db.query.tripInspections.findFirst({
            where: eq(tripInspections.id, id),
            with: {
                zone: true,
                inspectedByUser: {
                    columns: { id: true, fullName: true },
                },
                completedByUser: {
                    columns: { id: true, fullName: true },
                },
            },
        });

        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        // Parse zone polyline and extract first point as starting location for map
        let startPoint: { lat: number; lng: number } | null = null;
        try {
            const points: { lat: number; lng: number; order: number }[] = JSON.parse(trip.zone?.pointsGeojson ?? 'null');
            if (points.length > 0) {
                const first = points.sort((a, b) => a.order - b.order)[0];
                startPoint = { lat: first.lat, lng: first.lng };
            }
        } catch {
            // pointsGeojson could not be parsed — startPoint stays null
        }

        // Fetch before and after photos from jobPhotos table
        const photos = await db.query.jobPhotos.findMany({
            where: and(
                eq(jobPhotos.jobType, 'trip'),
                eq(jobPhotos.jobId, id)
            ),
        });

        const beforePhotos = photos.filter(p => p.photoType === 'before').map(p => p.photoUrl);
        const afterPhotos = photos.filter(p => p.photoType === 'after').map(p => p.photoUrl);

        return NextResponse.json({ trip, startPoint, beforePhotos, afterPhotos });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireMobileAuth();
        const { id } = await params;

        const trip = await db.query.tripInspections.findFirst({
            where: eq(tripInspections.id, id),
        });
        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        const body = await request.json();
        const { street_name, avenue_name, high_point, low_point, length, notes } = body;

        await db.update(tripInspections)
            .set({
                ...(street_name !== undefined && { streetName: street_name }),
                ...(avenue_name !== undefined && { avenueName: avenue_name }),
                ...(high_point !== undefined && { highPoint: String(high_point) }),
                ...(low_point !== undefined && { lowPoint: String(low_point) }),
                ...(length !== undefined && { length: String(length) }),
                ...(notes !== undefined && { notes }),
                updatedAt: new Date(),
            })
            .where(eq(tripInspections.id, id));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireMobileAuth();
        const { id } = await params;

        const trip = await db.query.tripInspections.findFirst({
            where: eq(tripInspections.id, id),
        });
        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        // Delete associated photos first, then the job
        await db.delete(jobPhotos).where(
            and(eq(jobPhotos.jobType, 'trip'), eq(jobPhotos.jobId, id))
        );
        await db.delete(tripInspections).where(eq(tripInspections.id, id));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
