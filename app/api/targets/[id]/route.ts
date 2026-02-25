import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { targets, targetUsers } from '@/db/schema';
import { requireAuth } from '@/lib/utils/session';
import { logAudit } from '@/lib/utils/audit';
import { eq } from 'drizzle-orm';

// GET /api/targets/[id] - Get single target with assigned users
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAuth();
        const { id } = await params;

        const target = await db.query.targets.findFirst({
            where: eq(targets.id, id),
            with: {
                targetUsers: {
                    with: {
                        user: {
                            columns: { id: true, fullName: true, email: true },
                        },
                    },
                },
            },
        });

        if (!target) {
            return NextResponse.json({ error: 'Target not found' }, { status: 404 });
        }

        return NextResponse.json({ target });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH /api/targets/[id] - Archive a target
export async function PATCH(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAuth();
        const { id } = await params;

        const [updated] = await db
            .update(targets)
            .set({ status: 'archived' })
            .where(eq(targets.id, id))
            .returning();

        if (!updated) {
            return NextResponse.json({ error: 'Target not found' }, { status: 404 });
        }

        await logAudit({
            userId: user.id,
            action: 'archive_target',
            module: 'targets',
            entityType: 'target',
            entityId: id,
            metadata: { name: updated.name },
        });

        return NextResponse.json({ success: true, target: updated });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/targets/[id] - Permanently delete a target
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAuth();
        const { id } = await params;

        // Delete assignments first (FK constraint)
        await db.delete(targetUsers).where(eq(targetUsers.targetId, id));

        const [deleted] = await db
            .delete(targets)
            .where(eq(targets.id, id))
            .returning();

        if (!deleted) {
            return NextResponse.json({ error: 'Target not found' }, { status: 404 });
        }

        await logAudit({
            userId: user.id,
            action: 'delete_target',
            module: 'targets',
            entityType: 'target',
            entityId: id,
            metadata: { name: deleted.name },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
