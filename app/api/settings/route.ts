import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { companySettings, wifiConfigs } from '@/db/schema';
import { requireAuth } from '@/lib/utils/session';
import { logAudit } from '@/lib/utils/audit';
import { eq } from 'drizzle-orm';

// GET /api/settings
export async function GET() {
  try {
    await requireAuth();

    const settings = await db.query.companySettings.findFirst();

    return NextResponse.json({
      settings: settings || {},
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/settings - Update company settings
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();

    const updates = await request.json();

    const existing = await db.query.companySettings.findFirst();

    if (existing) {
      await db.update(companySettings)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(companySettings.id, existing.id));
    } else {
      await db.insert(companySettings).values(updates);
    }

    await logAudit({
      userId: user.id,
      action: 'update_settings',
      module: 'settings',
      entityType: 'company_settings',
      metadata: updates,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
