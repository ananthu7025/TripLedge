import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tripInspections } from '@/db/schema';
import { requireMobileAuth } from '@/lib/utils/session';
import { eq } from 'drizzle-orm';

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

        return NextResponse.json({ trip });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
