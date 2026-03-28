import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { requireMobileAuth } from '@/lib/utils/session';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        await requireMobileAuth();

        const result = await db
            .select({ id: users.id, fullName: users.fullName })
            .from(users)
            .where(eq(users.status, 'active'));

        return NextResponse.json({ users: result });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
