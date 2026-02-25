import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials } from '@/lib/auth';
import { signToken } from '@/lib/utils/jwt';
import { logAudit } from '@/lib/utils/audit';

export async function POST(request: NextRequest) {
    try {
        console.log("hit happeded")
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const user = await verifyCredentials(email, password);

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Generate JWT token for mobile
        const token = await signToken(user);

        await logAudit({
            userId: user.id,
            action: 'mobile_login',
            module: 'auth',
            entityType: 'user',
            entityId: user.id,
        });

        return NextResponse.json({
            success: true,
            token,
            user,
        });
    } catch (error) {
        console.error('Mobile login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
