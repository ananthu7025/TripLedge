import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tripInspections } from '@/db/schema';
import { requireMobileAuth } from '@/lib/utils/session';
import { eq, and, isNotNull, desc } from 'drizzle-orm';

// GET /api/mobile/zones/:id/addresses
// Returns distinct street names previously used for trip jobs in this zone
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireMobileAuth();
        const { id } = await params;

        const rows = await db
            .select({ streetName: tripInspections.streetName, createdAt: tripInspections.createdAt })
            .from(tripInspections)
            .where(and(eq(tripInspections.zoneId, id), isNotNull(tripInspections.streetName)))
            .orderBy(desc(tripInspections.createdAt));

        // Deduplicate while preserving most-recent-first order
        const seen = new Set<string>();
        const addresses: string[] = [];
        for (const row of rows) {
            const name = row.streetName!.trim();
            if (name && !seen.has(name)) {
                seen.add(name);
                addresses.push(name);
                if (addresses.length === 10) break;
            }
        }

        return NextResponse.json({ addresses });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
