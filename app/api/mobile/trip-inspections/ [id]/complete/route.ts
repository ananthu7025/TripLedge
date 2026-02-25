import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tripInspections } from '@/db/schema';
import { requireMobileAuth } from '@/lib/utils/session';
import { logAudit } from '@/lib/utils/audit';
import { eq } from 'drizzle-orm';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireMobileAuth();
        const { id } = await params;
        const { after_photo, notes } = await request.json();

        const trip = await db.query.tripInspections.findFirst({
            where: eq(tripInspections.id, id),
        });

        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        if (trip.status !== 'inspected') {
            return NextResponse.json({ error: 'Trip must be in inspected status to complete' }, { status: 400 });
        }

        await db.update(tripInspections)
            .set({
                status: 'completed',
                completedBy: user.id,
                completedAt: new Date(),
                afterPhotoUrl: after_photo,
                notes: notes,
                updatedAt: new Date(),
            })
            .where(eq(tripInspections.id, id));

        await logAudit({
            userId: user.id,
            action: 'complete_trip_inspection',
            module: 'trip_inspection',
            entityType: 'trip_inspection',
            entityId: id,
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Complete trip inspection error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
