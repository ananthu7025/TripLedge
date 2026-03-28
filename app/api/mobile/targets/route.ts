import { NextResponse } from 'next/server';
import { db } from '@/db';
import { targetUsers, targets, tripInspections, snowRemovals } from '@/db/schema';
import { requireMobileAuth } from '@/lib/utils/session';
import { eq, and, sql } from 'drizzle-orm';

// GET /api/mobile/targets
// Returns active targets assigned to the logged-in technician with progress
export async function GET() {
  try {
    const user = await requireMobileAuth();

    // Get all active targets
    const allActiveTargets = await db.query.targets.findMany({
      where: eq(targets.status, 'active'),
    });

    // Get this user's specific allocations (if any)
    const userAllocations = await db.query.targetUsers.findMany({
      where: eq(targetUsers.userId, user.id),
    });
    const allocationMap = new Map(userAllocations.map((a) => [a.targetId, a.allocatedValue]));

    // For each target, calculate consumed value based on job count
    const result = await Promise.all(
      allActiveTargets.map(async (target) => {
        const rawAllocated = allocationMap.get(target.id) ?? target.value;
        let consumedValue = 0;

        if (target.module === 'trip') {
          const [row] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(tripInspections)
            .where(
              and(
                eq(tripInspections.completedBy, user.id),
                eq(tripInspections.status, 'completed')
              )
            );
          consumedValue = row?.count ?? 0;
        } else if (target.module === 'snow') {
          const [row] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(snowRemovals)
            .where(
              and(
                eq(snowRemovals.completedBy, user.id),
                eq(snowRemovals.status, 'completed')
              )
            );
          consumedValue = row?.count ?? 0;
        }

        const allocatedValue = parseFloat(rawAllocated);
        const remainingValue = Math.max(0, allocatedValue - consumedValue);

        return {
          id: target.id,
          name: target.name,
          module: target.module,
          period: target.period,
          periodLabel: target.periodLabel,
          unit: target.unit,
          allocatedValue: parseFloat(allocatedValue.toFixed(2)),
          consumedValue: parseFloat(consumedValue.toFixed(2)),
          remainingValue: parseFloat(remainingValue.toFixed(2)),
          status: target.status,
        };
      })
    );

    return NextResponse.json({ targets: result });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Fetch mobile targets error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
