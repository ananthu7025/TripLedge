import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dropdownOptions } from '@/db/schema';
import { requireAuth } from '@/lib/utils/session';
import { eq } from 'drizzle-orm';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const { label, sortOrder, isActive } = body;
    const [updated] = await db.update(dropdownOptions)
        .set({
            ...(label !== undefined && { label }),
            ...(sortOrder !== undefined && { sortOrder }),
            ...(isActive !== undefined && { isActive }),
            updatedAt: new Date(),
        })
        .where(eq(dropdownOptions.id, id))
        .returning();
    return NextResponse.json({ option: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await requireAuth();
    const { id } = await params;
    await db.delete(dropdownOptions).where(eq(dropdownOptions.id, id));
    return NextResponse.json({ success: true });
}
