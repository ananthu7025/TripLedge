import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tripInspections } from '@/db/schema';
import { requireMobileAuth } from '@/lib/utils/session';
import { eq, or, desc } from 'drizzle-orm';

export async function GET() {
    try {
        await requireMobileAuth();

        const trips = await db.query.tripInspections.findMany({
            where: or(
                eq(tripInspections.status, 'pending'),
                eq(tripInspections.status, 'inspected')
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
