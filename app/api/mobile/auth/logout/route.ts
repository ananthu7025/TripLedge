import { NextResponse } from 'next/server';

export async function POST() {
    // Mobile app usually handles logout by clearing the token locally.
    // We can return a success response here.
    return NextResponse.json({ success: true });
}
