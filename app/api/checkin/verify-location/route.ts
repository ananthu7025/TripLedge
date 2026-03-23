import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { checkinRequests, attendance, companySettings } from '@/db/schema';
import { requireAuth } from '@/lib/utils/session';
import { logAudit } from '@/lib/utils/audit';

const DEFAULT_OFFICE_LAT = 52.7758;
const DEFAULT_OFFICE_LNG = -108.2972;
const RADIUS_METERS = 200;

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { latitude, longitude } = await request.json();

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const officeConfig = await db.query.companySettings.findFirst();
    const officeLat = officeConfig?.officeLatitude
      ? parseFloat(officeConfig.officeLatitude)
      : DEFAULT_OFFICE_LAT;
    const officeLng = officeConfig?.officeLongitude
      ? parseFloat(officeConfig.officeLongitude)
      : DEFAULT_OFFICE_LNG;

    const distance = getDistance(latitude, longitude, officeLat, officeLng);

    if (distance <= RADIUS_METERS) {
      const today = new Date().toISOString().split('T')[0];
      const checkInTime = new Date().toTimeString().split(' ')[0];

      await db.insert(attendance).values({
        userId: user.id,
        date: today,
        checkInTime,
        method: 'gps_auto',
        locationName: 'Office (Auto)',
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        status: 'present',
      });

      await logAudit({
        userId: user.id,
        action: 'auto_checkin',
        module: 'attendance',
        entityType: 'attendance',
        entityId: undefined,
      });

      return NextResponse.json({ auto_approved: true });
    } else {
      const requestId = `REQ-${Math.floor(Date.now() / 1000)}`;
      const [newRequest] = await db
        .insert(checkinRequests)
        .values({
          requestId,
          userId: user.id,
          requestedAt: new Date(),
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          status: 'pending',
        })
        .returning();

      await logAudit({
        userId: user.id,
        action: 'checkin_request_created',
        module: 'attendance',
        entityType: 'checkin_request',
        entityId: newRequest.id,
      });

      return NextResponse.json({
        auto_approved: false,
        id: newRequest.id,
        requestId: newRequest.requestId,
      });
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Web verify-location error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
