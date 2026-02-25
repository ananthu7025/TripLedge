import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tripInspections } from '@/db/schema';
import { requireAuth } from '@/lib/utils/session';
import { eq, desc, and, sql } from 'drizzle-orm';

// GET /api/trip-inspections?status=pending
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = db.query.tripInspections.findMany({
      orderBy: [desc(tripInspections.createdAt)],
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

    let trips;
    if (status) {
      trips = await db.query.tripInspections.findMany({
        where: eq(tripInspections.status, status),
        orderBy: [desc(tripInspections.createdAt)],
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
      trips = await query;
    }

    return NextResponse.json({ trips });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching trip inspections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET stats
export async function OPTIONS() {
  try {
    await requireAuth();

    const stats = await db
      .select({
        status: tripInspections.status,
        count: sql<number>`count(*)::int`,
      })
      .from(tripInspections)
      .groupBy(tripInspections.status);

    const statsMap = stats.reduce((acc, { status, count }) => {
      acc[status] = count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      pending: statsMap.pending || 0,
      inspected: statsMap.inspected || 0,
      completed: statsMap.completed || 0,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
