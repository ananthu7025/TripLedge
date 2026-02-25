import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { snowRemovals } from '@/db/schema';
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

        const snow = await db.query.snowRemovals.findFirst({
            where: eq(snowRemovals.id, id),
        });

        if (!snow) {
            return NextResponse.json({ error: 'Snow removal job not found' }, { status: 404 });
        }

        if (snow.status !== 'in_progress') {
            return NextResponse.json({ error: 'Snow removal job must be in_progress status to complete' }, { status: 400 });
        }

        await db.update(snowRemovals)
            .set({
                status: 'completed',
                completedBy: user.id,
                completedAt: new Date(),
                afterPhotoUrl: after_photo,
                notes: notes,
                updatedAt: new Date(),
            })
            .where(eq(snowRemovals.id, id));

        await logAudit({
            userId: user.id,
            action: 'complete_snow_removal',
            module: 'snow_removal',
            entityType: 'snow_removal',
            entityId: id,
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Complete snow removal error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
