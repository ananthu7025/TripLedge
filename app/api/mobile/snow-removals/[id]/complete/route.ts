import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { snowRemovals, jobPhotos } from '@/db/schema';
import { requireMobileAuth } from '@/lib/utils/session';
import { logAudit } from '@/lib/utils/audit';
import { eq } from 'drizzle-orm';

const REQUIRED_AFTER_PHOTOS = 5;

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireMobileAuth();
        const { id } = await params;
        const { after_photos, tools_used, materials_used, solution_description, crew_members } = await request.json();

        if (!after_photos || !Array.isArray(after_photos) || after_photos.length < REQUIRED_AFTER_PHOTOS) {
            return NextResponse.json(
                { error: `after_photos must contain exactly ${REQUIRED_AFTER_PHOTOS} photos` },
                { status: 400 }
            );
        }

        if (!tools_used || !Array.isArray(tools_used) || tools_used.length === 0) {
            return NextResponse.json({ error: 'tools_used must be a non-empty array' }, { status: 400 });
        }

        if (!materials_used || !Array.isArray(materials_used) || materials_used.length === 0) {
            return NextResponse.json({ error: 'materials_used must be a non-empty array' }, { status: 400 });
        }

        if (!solution_description || typeof solution_description !== 'string' || solution_description.trim() === '') {
            return NextResponse.json({ error: 'solution_description is required' }, { status: 400 });
        }

        if (!crew_members || !Array.isArray(crew_members) || crew_members.length === 0) {
            return NextResponse.json({ error: 'crew_members must be a non-empty array' }, { status: 400 });
        }

        const snow = await db.query.snowRemovals.findFirst({
            where: eq(snowRemovals.id, id),
        });

        if (!snow) {
            return NextResponse.json({ error: 'Snow removal job not found' }, { status: 404 });
        }

        if (snow.status !== 'inspected') {
            return NextResponse.json({ error: 'Snow removal job must be in inspected status to complete' }, { status: 400 });
        }

        await db.update(snowRemovals)
            .set({
                status: 'completed',
                completedBy: user.id,
                completedAt: new Date(),
                toolsUsed: JSON.stringify(tools_used),
                materialsUsed: JSON.stringify(materials_used),
                solutionDescription: solution_description.trim(),
                crewMembers: JSON.stringify(crew_members),
                updatedAt: new Date(),
            })
            .where(eq(snowRemovals.id, id));

        await db.insert(jobPhotos).values(
            after_photos.map((url: string) => ({
                jobType: 'snow',
                jobId: id,
                photoType: 'after',
                photoUrl: url,
                uploadedBy: user.id,
            }))
        );

        await logAudit({
            userId: user.id,
            action: 'complete_snow_removal',
            module: 'snow_removal',
            entityType: 'snow_removal',
            entityId: id,
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Complete snow removal error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
