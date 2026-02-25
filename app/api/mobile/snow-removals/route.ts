import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { snowRemovals } from '@/db/schema';
import { requireMobileAuth } from '@/lib/utils/session';
import { eq, or, desc } from 'drizzle-orm';

export async function GET() {
    try {
        await requireMobileAuth();

        const snows = await db.query.snowRemovals.findMany({
            where: or(
                eq(snowRemovals.status, 'pending'),
                eq(snowRemovals.status, 'in_progress')
            ),
            orderBy: [desc(snowRemovals.createdAt)],
            with: {
                zone: true,
            },
        });

        return NextResponse.json({ snows });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Fetch mobile snow removals error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
