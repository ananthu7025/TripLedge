import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dropdownOptions } from '@/db/schema';
import { requireAuth } from '@/lib/utils/session';
import { asc } from 'drizzle-orm';

export async function GET() {
    await requireAuth();
    const options = await db.select().from(dropdownOptions)
        .orderBy(asc(dropdownOptions.category), asc(dropdownOptions.sortOrder));
    return NextResponse.json({ options });
}

export async function POST(req: NextRequest) {
    const user = await requireAuth();
    const body = await req.json();
    const { category, label, sortOrder = 0, isActive = true } = body;
    if (!category || !label) {
        return NextResponse.json({ error: 'category and label are required' }, { status: 400 });
    }
    const [created] = await db.insert(dropdownOptions).values({
        category, label, sortOrder, isActive, createdBy: user.id,
    }).returning();
    return NextResponse.json({ option: created }, { status: 201 });
}
