import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { checkinRequests, attendance } from '@/db/schema';
import { requireAuth } from '@/lib/utils/session';
import { logAudit } from '@/lib/utils/audit';
import { eq, desc } from 'drizzle-orm';

// GET /api/checkin-requests
export async function GET() {
  try {
    await requireAuth();

    const requests = await db.query.checkinRequests.findMany({
      orderBy: [desc(checkinRequests.createdAt)],
      with: {
        user: {
          columns: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        reviewedByUser: {
          columns: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json({ requests });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching check-in requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/checkin-requests/approve
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { requestId, action } = await request.json();

    if (!requestId || !action) {
      return NextResponse.json(
        { error: 'Request ID and action are required' },
        { status: 400 }
      );
    }

    const checkInRequest = await db.query.checkinRequests.findFirst({
      where: eq(checkinRequests.id, requestId),
    });

    if (!checkInRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    await db.update(checkinRequests)
      .set({
        status: action,
        reviewedBy: user.id,
        reviewedAt: new Date(),
      })
      .where(eq(checkinRequests.id, requestId));

    if (action === 'approved') {
      const today = new Date().toISOString().split('T')[0];
      const checkInTime = new Date(checkInRequest.requestedAt).toTimeString().split(' ')[0];

      await db.insert(attendance).values({
        userId: checkInRequest.userId,
        date: today,
        checkInTime,
        method: 'request',
        latitude: checkInRequest.latitude,
        longitude: checkInRequest.longitude,
        status: 'present',
        checkInRequestId: requestId,
      });
    }

    await logAudit({
      userId: user.id,
      action: `${action}_checkin_request`,
      module: 'attendance',
      entityType: 'checkin_request',
      entityId: requestId,
      metadata: { requestId: checkInRequest.requestId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error processing check-in request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
