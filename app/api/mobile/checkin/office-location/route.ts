import { NextResponse } from 'next/server';
import { db } from '@/db';
import { wifiConfigs } from '@/db/schema';
import { requireMobileAuth } from '@/lib/utils/session';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        await requireMobileAuth();

        // Get the office location from company settings
        const settings = await db.query.companySettings.findFirst();

        if (!settings || !settings.officeLatitude || !settings.officeLongitude) {
            // Fallback to hardcoded coordinates if none found in DB
            return NextResponse.json({
                latitude: 52.7758,
                longitude: -108.2972,
                locationName: 'Main Office (Default)',
            });
        }

        return NextResponse.json({
            latitude: parseFloat(settings.officeLatitude),
            longitude: parseFloat(settings.officeLongitude),
            locationName: settings.officeAddress || 'Main Office',
        });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
