import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { requireMobileAuth } from '@/lib/utils/session';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        const authenticatedUser = await requireMobileAuth();

        const user = await db.query.users.findFirst({
            where: eq(users.id, authenticatedUser.id),
            with: {
                role: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role.name,
                status: user.status,
                avatarUrl: user.avatarUrl,
            },
        });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Fetch mobile profile error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
