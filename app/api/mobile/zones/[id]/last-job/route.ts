import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { zones, tripInspections, snowRemovals } from '@/db/schema';
import { requireMobileAuth } from '@/lib/utils/session';
import { eq, desc } from 'drizzle-orm';

// GET /api/mobile/zones/:id/last-job
// Returns street_name and avenue_name from the most recently created job for this zone
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireMobileAuth();
        const { id } = await params;

        const zone = await db.query.zones.findFirst({
            where: eq(zones.id, id),
        });

        if (!zone) {
            return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
        }

        let streetName: string | null = null;
        let avenueName: string | null = null;

        if (zone.module === 'trip' || zone.module === 'both') {
            const last = await db.query.tripInspections.findFirst({
                where: eq(tripInspections.zoneId, id),
                orderBy: [desc(tripInspections.createdAt)],
            });
            if (last) {
                streetName = last.streetName ?? null;
                avenueName = last.avenueName ?? null;
            }
        } else if (zone.module === 'snow') {
            const last = await db.query.snowRemovals.findFirst({
                where: eq(snowRemovals.zoneId, id),
                orderBy: [desc(snowRemovals.createdAt)],
            });
            if (last) {
                streetName = last.streetName ?? null;
                avenueName = last.avenueName ?? null;
            }
        }

        return NextResponse.json({ streetName, avenueName });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Last job error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
