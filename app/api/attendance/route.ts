import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { attendance } from '@/db/schema';
import { requireAuth } from '@/lib/utils/session';
import { desc, eq, and, gte, lte } from 'drizzle-orm';

// GET /api/attendance?startDate=2025-01-01&endDate=2025-01-31&method=request
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const method = searchParams.get('method');

    let whereConditions = [];

    if (startDate) {
      whereConditions.push(gte(attendance.date, startDate));
    }

    if (endDate) {
      whereConditions.push(lte(attendance.date, endDate));
    }

    if (method) {
      whereConditions.push(eq(attendance.method, method));
    }

    const records = await db.query.attendance.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      orderBy: [desc(attendance.date), desc(attendance.checkInTime)],
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

    return NextResponse.json({ attendance: records });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
