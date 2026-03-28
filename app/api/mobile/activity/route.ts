import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tripInspections, snowRemovals } from '@/db/schema';
import { requireMobileAuth } from '@/lib/utils/session';
import { or, eq, desc } from 'drizzle-orm';

// GET /api/mobile/activity
// Returns the last 10 jobs (trip + snow) the user was involved in, newest first
export async function GET() {
  try {
    const user = await requireMobileAuth();

    const [trips, snows] = await Promise.all([
      db.query.tripInspections.findMany({
        where: or(
          eq(tripInspections.createdBy, user.id),
          eq(tripInspections.inspectedBy, user.id),
          eq(tripInspections.completedBy, user.id),
        ),
        columns: {
          id: true,
          status: true,
          streetName: true,
          houseNo: true,
          inspectedAt: true,
          completedAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: [desc(tripInspections.updatedAt)],
        limit: 10,
      }),
      db.query.snowRemovals.findMany({
        where: or(
          eq(snowRemovals.createdBy, user.id),
          eq(snowRemovals.inspectedBy, user.id),
          eq(snowRemovals.completedBy, user.id),
        ),
        columns: {
          id: true,
          status: true,
          streetName: true,
          houseNo: true,
          inspectedAt: true,
          completedAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: [desc(snowRemovals.updatedAt)],
        limit: 10,
      }),
    ]);

    const combined = [
      ...trips.map((j) => ({ ...j, type: 'trip' as const })),
      ...snows.map((j) => ({ ...j, type: 'snow' as const })),
    ]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10)
      .map((j) => ({
        id: j.id,
        type: j.type,
        status: j.status,
        streetName: j.streetName ?? null,
        houseNo: j.houseNo ?? null,
        timestamp:
          j.status === 'completed'
            ? j.completedAt
            : j.status === 'inspected'
            ? j.inspectedAt
            : j.createdAt,
      }));

    return NextResponse.json({ activities: combined });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Fetch mobile activity error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
