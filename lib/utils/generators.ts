import { db } from '@/db';
import { tripInspections, snowRemovals, checkinRequests, reports } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function generateTripId(): Promise<string> {
  const lastTrip = await db.query.tripInspections.findFirst({
    orderBy: [desc(tripInspections.createdAt)],
  });

  if (!lastTrip) return 'T-001';

  const lastNumber = parseInt(lastTrip.tripId.split('-')[1]);
  return `T-${String(lastNumber + 1).padStart(3, '0')}`;
}

export async function generateSnowId(): Promise<string> {
  const lastSnow = await db.query.snowRemovals.findFirst({
    orderBy: [desc(snowRemovals.createdAt)],
  });

  if (!lastSnow) return 'S-001';

  const lastNumber = parseInt(lastSnow.snowId.split('-')[1]);
  return `S-${String(lastNumber + 1).padStart(3, '0')}`;
}

export async function generateRequestId(): Promise<string> {
  const lastRequest = await db.query.checkinRequests.findFirst({
    orderBy: [desc(checkinRequests.createdAt)],
  });

  if (!lastRequest) return 'REQ-001';

  const lastNumber = parseInt(lastRequest.requestId.split('-')[1]);
  return `REQ-${String(lastNumber + 1).padStart(3, '0')}`;
}

export async function generateReportId(): Promise<string> {
  const lastReport = await db.query.reports.findFirst({
    orderBy: [desc(reports.createdAt)],
  });

  if (!lastReport) return 'RPT-001';

  const lastNumber = parseInt(lastReport.reportId.split('-')[1]);
  return `RPT-${String(lastNumber + 1).padStart(3, '0')}`;
}
