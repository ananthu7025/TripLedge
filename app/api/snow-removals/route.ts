import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { snowRemovals } from '@/db/schema';
import { requireAuth } from '@/lib/utils/session';
import { eq, desc, sql } from 'drizzle-orm';

// GET /api/snow-removals?status=pending
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let snows;
    if (status) {
      snows = await db.query.snowRemovals.findMany({
        where: eq(snowRemovals.status, status),
        orderBy: [desc(snowRemovals.createdAt)],
        with: {
          zone: true,
          inspectedByUser: {
            columns: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          completedByUser: {
            columns: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });
    } else {
      snows = await db.query.snowRemovals.findMany({
        orderBy: [desc(snowRemovals.createdAt)],
        with: {
          zone: true,
          inspectedByUser: {
            columns: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          completedByUser: {
            columns: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });
    }

    return NextResponse.json({ snows });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching snow removals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET stats
export async function OPTIONS() {
  try {
    await requireAuth();

    const stats = await db
      .select({
        status: snowRemovals.status,
        count: sql<number>`count(*)::int`,
      })
      .from(snowRemovals)
      .groupBy(snowRemovals.status);

    const statsMap = stats.reduce((acc, { status, count }) => {
      acc[status] = count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      pending: statsMap.pending || 0,
      in_progress: statsMap.in_progress || 0,
      completed: statsMap.completed || 0,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
