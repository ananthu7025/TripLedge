import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tripInspections, snowRemovals } from '@/db/schema';
import { requireMobileAuth } from '@/lib/utils/session';
import { and, eq, gte, sql } from 'drizzle-orm';

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(): Date {
  const d = new Date();
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? 6 : day - 1; // Monday-based
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// GET /api/mobile/stats
// Returns dynamic values for the HomeScreen stat cards
export async function GET() {
  try {
    const user = await requireMobileAuth();

    const todayStart = startOfToday();
    const weekStart = startOfWeek();

    const [
      snowJobsToday,
      completedSnowJobs,
      tripInspectionsToday,
      completedTripsThisWeek,
    ] = await Promise.all([
      // Snow jobs created today by this user
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(snowRemovals)
        .where(
          and(
            eq(snowRemovals.createdBy, user.id),
            gte(snowRemovals.createdAt, todayStart)
          )
        )
        .then((r) => r[0]?.count ?? 0),

      // All completed snow jobs by this user (for total removed sum)
      db.query.snowRemovals.findMany({
        where: and(
          eq(snowRemovals.completedBy, user.id),
          eq(snowRemovals.status, 'completed')
        ),
        columns: { highPoint: true, lowPoint: true, length: true },
      }),

      // Trip inspections created today by this user
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(tripInspections)
        .where(
          and(
            eq(tripInspections.createdBy, user.id),
            gte(tripInspections.createdAt, todayStart)
          )
        )
        .then((r) => r[0]?.count ?? 0),

      // Completed trip inspections this week by this user
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(tripInspections)
        .where(
          and(
            eq(tripInspections.completedBy, user.id),
            eq(tripInspections.status, 'completed'),
            gte(tripInspections.completedAt, weekStart)
          )
        )
        .then((r) => r[0]?.count ?? 0),
    ]);

    const totalSnowRemoved = completedSnowJobs.reduce((sum, job) => {
      return (
        sum +
        parseFloat(job.highPoint ?? '0') +
        parseFloat(job.lowPoint ?? '0') +
        parseFloat(job.length ?? '0')
      );
    }, 0);

    return NextResponse.json({
      snowJobsToday,
      totalSnowRemoved: parseFloat(totalSnowRemoved.toFixed(2)),
      tripInspectionsToday,
      completedTripsThisWeek,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Fetch mobile stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
