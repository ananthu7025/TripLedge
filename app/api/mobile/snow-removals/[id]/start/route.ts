import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { snowRemovals } from '@/db/schema';
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

        const snow = await db.query.snowRemovals.findFirst({
            where: eq(snowRemovals.id, id),
        });

        if (!snow) {
            return NextResponse.json({ error: 'Snow removal job not found' }, { status: 404 });
        }

        if (snow.status !== 'pending') {
            return NextResponse.json({ error: 'Snow removal job is already in progress or completed' }, { status: 400 });
        }

        await db.update(snowRemovals)
            .set({
                status: 'in_progress',
                inspectedBy: user.id, // Using 'inspectedBy' field for starting the job as per schema
                updatedAt: new Date(),
            })
            .where(eq(snowRemovals.id, id));

        await logAudit({
            userId: user.id,
            action: 'start_snow_removal',
            module: 'snow_removal',
            entityType: 'snow_removal',
            entityId: id,
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Start snow removal error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
