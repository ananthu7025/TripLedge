import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reports } from '@/db/schema';
import { requireAuth } from '@/lib/utils/session';
import { logAudit } from '@/lib/utils/audit';
import { generateReportId } from '@/lib/utils/generators';
import { desc } from 'drizzle-orm';

// GET /api/reports
export async function GET() {
  try {
    await requireAuth();

    const allReports = await db.query.reports.findMany({
      orderBy: [desc(reports.createdAt)],
      with: {
        generatedByUser: {
          columns: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ reports: allReports });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/reports - Generate new report
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { title, type, dateRangeStart, dateRangeEnd, relatedId } = await request.json();

    if (!title || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const reportId = await generateReportId();

    const [newReport] = await db.insert(reports).values({
      reportId,
      title,
      type,
      dateRangeStart,
      dateRangeEnd,
      relatedId,
      status: 'ready',
      fileUrl: `/api/reports/${reportId}/download`,   // streams a real .xlsx file
      generatedBy: user.id,
      generatedAt: new Date(),
    }).returning();

    await logAudit({
      userId: user.id,
      action: 'generate_report',
      module: 'reports',
      entityType: 'report',
      entityId: newReport.id,
      metadata: { type, title },
    });

    return NextResponse.json({ success: true, report: newReport });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
