import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { zones, tripInspections } from '@/db/schema';
import { requireAuth } from '@/lib/utils/session';
import { logAudit } from '@/lib/utils/audit';
import { eq, desc } from 'drizzle-orm';

// GET /api/zones - Get all zones
export async function GET() {
  try {
    await requireAuth();

    const allZones = await db.query.zones.findMany({
      orderBy: [desc(zones.createdAt)],
      with: {
        createdBy: {
          columns: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ zones: allZones });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching zones:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/zones - Create a new zone
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { name, zoneType, points } = body;

    if (!name || !zoneType || !points) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [newZone] = await db.insert(zones).values({
      name,
      zoneType,
      pointsGeojson: JSON.stringify(points),
      totalPoints: points.length,
      createdBy: user.id,
    }).returning();

    await logAudit({
      userId: user.id,
      action: 'create_zone',
      module: 'zones',
      entityType: 'zone',
      entityId: newZone.id,
      metadata: { zoneName: name },
    });

    return NextResponse.json({
      success: true,
      zone: newZone,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating zone:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/zones?id=xxx - Delete a zone
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Zone ID is required' }, { status: 400 });
    }

    // Delete related records first to avoid foreign key constraint errors
    // Delete all trip inspections for this zone
    await db.delete(tripInspections).where(eq(tripInspections.zoneId, id));

    // Now delete the zone itself
    await db.delete(zones).where(eq(zones.id, id));

    await logAudit({
      userId: user.id,
      action: 'delete_zone',
      module: 'zones',
      entityType: 'zone',
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error deleting zone:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
