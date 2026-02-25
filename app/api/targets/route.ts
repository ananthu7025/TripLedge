import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { targets, targetUsers, users, roles } from '@/db/schema';
import { requireAuth } from '@/lib/utils/session';
import { logAudit } from '@/lib/utils/audit';
import { eq, desc } from 'drizzle-orm';

// GET /api/targets
export async function GET() {
  try {
    await requireAuth();

    const allTargets = await db.query.targets.findMany({
      orderBy: [desc(targets.createdAt)],
      with: {
        targetUsers: {
          with: {
            user: {
              columns: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ targets: allTargets });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching targets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/targets - Create new target, auto-assigns all active technicians equally
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { name, module, period, periodLabel, value, unit, distribution } = await request.json();

    if (!name || !module || !period || !value || !unit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the target
    const [newTarget] = await db.insert(targets).values({
      name,
      module,
      period,
      periodLabel: periodLabel || period,
      value,
      unit,
      distribution: distribution || 'equal',
      status: 'active',
      createdBy: user.id,
    }).returning();

    // Auto-fetch all active technician users
    const technicianRole = await db.query.roles.findFirst({
      where: eq(roles.name, 'technician'),
    });

    if (technicianRole) {
      const technicians = await db.query.users.findMany({
        where: eq(users.roleId, technicianRole.id),
      });

      const activeTechnicians = technicians.filter(t => t.status === 'active' || t.status === 'invited');

      if (activeTechnicians.length > 0) {
        const allocatedValue = (parseFloat(value) / activeTechnicians.length).toFixed(2);

        const userAssignments = activeTechnicians.map(tech => ({
          targetId: newTarget.id,
          userId: tech.id,
          allocatedValue,
        }));

        await db.insert(targetUsers).values(userAssignments);
      }
    }

    await logAudit({
      userId: user.id,
      action: 'create_target',
      module: 'targets',
      entityType: 'target',
      entityId: newTarget.id,
      metadata: { name, module, unit },
    });

    return NextResponse.json({ success: true, target: newTarget });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating target:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
