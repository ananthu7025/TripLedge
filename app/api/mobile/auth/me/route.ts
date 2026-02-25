import { NextResponse } from 'next/server';
import { requireMobileAuth } from '@/lib/utils/session';

export async function GET() {
    try {
        const user = await requireMobileAuth();
        return NextResponse.json({ user });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
