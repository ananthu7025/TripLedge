import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { snowRemovals, jobPhotos } from '@/db/schema';
import { requireMobileAuth } from '@/lib/utils/session';
import { eq, and } from 'drizzle-orm';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireMobileAuth();
        const { id } = await params;

        const snow = await db.query.snowRemovals.findFirst({
            where: eq(snowRemovals.id, id),
            with: {
                inspectedByUser: {
                    columns: { id: true, fullName: true },
                },
                completedByUser: {
                    columns: { id: true, fullName: true },
                },
            },
        });

        if (!snow) {
            return NextResponse.json({ error: 'Snow removal job not found' }, { status: 404 });
        }

        const photos = await db.query.jobPhotos.findMany({
            where: and(
                eq(jobPhotos.jobType, 'snow'),
                eq(jobPhotos.jobId, id)
            ),
        });

        const beforePhotos = photos.filter(p => p.photoType === 'before').map(p => p.photoUrl);
        const afterPhotos = photos.filter(p => p.photoType === 'after').map(p => p.photoUrl);

        return NextResponse.json({ snow, beforePhotos, afterPhotos });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireMobileAuth();
        const { id } = await params;

        const snow = await db.query.snowRemovals.findFirst({
            where: eq(snowRemovals.id, id),
        });
        if (!snow) {
            return NextResponse.json({ error: 'Snow removal job not found' }, { status: 404 });
        }

        const body = await request.json();
        const { street_name, problem_description, tools_used, solution_description, notes } = body;

        await db.update(snowRemovals)
            .set({
                ...(street_name !== undefined && { streetName: street_name }),
                ...(problem_description !== undefined && { problemDescription: problem_description }),
                ...(tools_used !== undefined && { toolsUsed: tools_used }),
                ...(solution_description !== undefined && { solutionDescription: solution_description }),
                ...(notes !== undefined && { notes }),
                updatedAt: new Date(),
            })
            .where(eq(snowRemovals.id, id));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireMobileAuth();
        const { id } = await params;

        const snow = await db.query.snowRemovals.findFirst({
            where: eq(snowRemovals.id, id),
        });
        if (!snow) {
            return NextResponse.json({ error: 'Snow removal job not found' }, { status: 404 });
        }

        await db.delete(jobPhotos).where(
            and(eq(jobPhotos.jobType, 'snow'), eq(jobPhotos.jobId, id))
        );
        await db.delete(snowRemovals).where(eq(snowRemovals.id, id));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
