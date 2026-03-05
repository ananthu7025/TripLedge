import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { snowRemovals, jobPhotos } from '@/db/schema';
import { requireMobileAuth } from '@/lib/utils/session';
import { eq, and } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireMobileAuth();
        const { id } = await params;

        const snow = await db.query.snowRemovals.findFirst({
            where: eq(snowRemovals.id, id),
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

        if (!snow) {
            return NextResponse.json({ error: 'Snow removal job not found' }, { status: 404 });
        }

        // Parse zone polyline and extract first point as starting location for map
        let startPoint: { lat: number; lng: number } | null = null;
        try {
            const points: { lat: number; lng: number; order: number }[] = JSON.parse(snow.zone.pointsGeojson);
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
                eq(jobPhotos.jobType, 'snow'),
                eq(jobPhotos.jobId, id)
            ),
        });

        const beforePhotos = photos.filter(p => p.photoType === 'before').map(p => p.photoUrl);
        const afterPhotos = photos.filter(p => p.photoType === 'after').map(p => p.photoUrl);

        return NextResponse.json({ snow, startPoint, beforePhotos, afterPhotos });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
