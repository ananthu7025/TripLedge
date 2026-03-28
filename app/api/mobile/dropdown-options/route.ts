import { NextResponse } from 'next/server';
import { db } from '@/db';
import { eq, asc } from 'drizzle-orm';
import { dropdownOptions } from '@/db/schema';

export async function GET() {
    const options = await db.select().from(dropdownOptions)
        .where(eq(dropdownOptions.isActive, true))
        .orderBy(asc(dropdownOptions.category), asc(dropdownOptions.sortOrder));

    const grouped = options.reduce((acc, opt) => {
        if (!acc[opt.category]) acc[opt.category] = [];
        acc[opt.category].push(opt.label);
        return acc;
    }, {} as Record<string, string[]>);

    return NextResponse.json({
        snow_issues: grouped['snow_issues'] ?? [],
        snow_tools: grouped['snow_tools'] ?? [],
        snow_materials: grouped['snow_materials'] ?? [],
    });
}
