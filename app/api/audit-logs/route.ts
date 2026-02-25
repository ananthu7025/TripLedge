import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import { requireAuth } from '@/lib/utils/session';
import { desc, eq, and, gte, lte } from 'drizzle-orm';

// GET /api/audit-logs?module=zones&startDate=2025-01-01&endDate=2025-01-31
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let whereConditions = [];

    if (module) {
      whereConditions.push(eq(auditLogs.module, module));
    }

    if (startDate) {
      whereConditions.push(gte(auditLogs.createdAt, new Date(startDate)));
    }

    if (endDate) {
      whereConditions.push(lte(auditLogs.createdAt, new Date(endDate)));
    }

    const logs = await db.query.auditLogs.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      orderBy: [desc(auditLogs.createdAt)],
      limit: 500,
      with: {
        user: {
          columns: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
