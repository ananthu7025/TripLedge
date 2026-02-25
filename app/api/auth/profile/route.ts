import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { requireAuth } from '@/lib/utils/session';
import { logAudit } from '@/lib/utils/audit';
import { hashPassword } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

// GET /api/auth/profile
export async function GET() {
    try {
        const user = await requireAuth();

        const userData = await db.query.users.findFirst({
            where: eq(users.id, user.id),
        });

        if (!userData) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { passwordHash, ...safeUser } = userData;
        return NextResponse.json({ user: safeUser });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH /api/auth/profile
export async function PATCH(request: NextRequest) {
    try {
        const user = await requireAuth();
        const { fullName, email, currentPassword, newPassword } = await request.json();

        const userData = await db.query.users.findFirst({
            where: eq(users.id, user.id),
        });

        if (!userData) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Handle Password Change
        if (currentPassword && newPassword) {
            const isPasswordValid = await bcrypt.compare(currentPassword, userData.passwordHash);
            if (!isPasswordValid) {
                return NextResponse.json({ error: 'Invalid current password' }, { status: 400 });
            }

            const hashedPassword = await hashPassword(newPassword);
            await db.update(users).set({ passwordHash: hashedPassword }).where(eq(users.id, user.id));

            await logAudit({
                userId: user.id,
                action: 'change_password',
                module: 'auth',
                entityType: 'user',
                entityId: user.id,
            });

            return NextResponse.json({ success: true, message: 'Password updated successfully' });
        }

        // Handle Profile Update
        const updates: any = {};
        if (fullName) updates.fullName = fullName;
        if (email) updates.email = email;

        if (Object.keys(updates).length > 0) {
            await db.update(users).set({ ...updates, updatedAt: new Date() }).where(eq(users.id, user.id));

            // Update session cookie
            const updatedUser = { ...user, ...updates };
            const cookieStore = await cookies();
            cookieStore.set('user_session', JSON.stringify(updatedUser), {
                httpOnly: false, // Match original session setting
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
            });

            await logAudit({
                userId: user.id,
                action: 'update_profile',
                module: 'auth',
                entityType: 'user',
                entityId: user.id,
                metadata: updates,
            });

            return NextResponse.json({ success: true, user: updatedUser });
        }

        return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
