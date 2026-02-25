import { NextResponse } from 'next/server';
import { db } from '@/db';
import { roles } from '@/db/schema';
import { requireAuth } from '@/lib/utils/session';
import { asc } from 'drizzle-orm';

// GET /api/roles
export async function GET() {
    try {
        await requireAuth();

        const allRoles = await db.query.roles.findMany({
            orderBy: [asc(roles.name)],
        });

        return NextResponse.json({ roles: allRoles });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Error fetching roles:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
