import { NextResponse } from 'next/server';
import { db } from '@/db';
import { zones } from '@/db/schema';
import { requireMobileAuth } from '@/lib/utils/session';
import { eq, desc } from 'drizzle-orm';

// GET /api/mobile/zones - Get all active zones for technician map view
export async function GET() {
    try {
        await requireMobileAuth();

        const allZones = await db.query.zones.findMany({
            where: eq(zones.isActive, true),
            orderBy: [desc(zones.createdAt)],
        });

        const zonesWithStartPoint = allZones.map((zone) => {
            let startPoint: { lat: number; lng: number } | null = null;
            try {
                const points: { lat: number; lng: number; order: number }[] = JSON.parse(zone.pointsGeojson);
                if (points.length > 0) {
                    const first = points.sort((a, b) => a.order - b.order)[0];
                    startPoint = { lat: first.lat, lng: first.lng };
                }
            } catch {
                // pointsGeojson could not be parsed
            }

            return {
                id: zone.id,
                name: zone.name,
                zoneType: zone.zoneType,
                startPoint,
                pointsGeojson: zone.pointsGeojson,
                totalPoints: zone.totalPoints,
                createdAt: zone.createdAt,
            };
        });

        return NextResponse.json({ zones: zonesWithStartPoint });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Fetch mobile zones error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
