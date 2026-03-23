import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogs } from '@/db/schema';
import { requireAuth } from '@/lib/utils/session';
import { desc } from 'drizzle-orm';
import { logAudit } from '@/lib/utils/audit';

export async function GET() {
  try {
    await requireAuth();

    const allBlogs = await db.query.blogs.findMany({
      orderBy: [desc(blogs.createdAt)],
      with: {
        author: {
          columns: { id: true, fullName: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json({ blogs: allBlogs });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { title, content, imageUrl } = await request.json();

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const [blog] = await db
      .insert(blogs)
      .values({
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl ?? null,
        authorId: user.id,
      })
      .returning();

    await logAudit({
      userId: user.id,
      action: 'create',
      module: 'blogs',
      entityType: 'blog',
      entityId: blog.id,
    });

    return NextResponse.json({ blog }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Create blog error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
