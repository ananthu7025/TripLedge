import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogs } from '@/db/schema';
import { requireAuth } from '@/lib/utils/session';
import { eq } from 'drizzle-orm';
import { logAudit } from '@/lib/utils/audit';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const blog = await db.query.blogs.findFirst({
      where: eq(blogs.id, id),
      with: {
        author: {
          columns: { id: true, fullName: true, avatarUrl: true },
        },
      },
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({ blog });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const existing = await db.query.blogs.findFirst({ where: eq(blogs.id, id) });
    if (!existing) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    await db.delete(blogs).where(eq(blogs.id, id));

    await logAudit({
      userId: user.id,
      action: 'delete',
      module: 'blogs',
      entityType: 'blog',
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
