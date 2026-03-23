import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { checkinRequests } from '@/db/schema';
import { requireAuth } from '@/lib/utils/session';
import { eq } from 'drizzle-orm';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    await requireAuth();
    const { requestId } = await params;

    const checkInRequest = await db.query.checkinRequests.findFirst({
      where: eq(checkinRequests.id, requestId),
    });

    if (!checkInRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ status: checkInRequest.status });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
