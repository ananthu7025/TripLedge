import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { snowRemovals, jobPhotos } from '@/db/schema';
import { requireMobileAuth } from '@/lib/utils/session';
import { logAudit } from '@/lib/utils/audit';
import { eq } from 'drizzle-orm';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireMobileAuth();
        const { id } = await params;
        const body = await request.json();

        const {
            street_name,
            house_no,
            issues,
            additional_comments,
            captured_latitude,
            captured_longitude,
            before_photos,
        } = body;

        if (!street_name || typeof street_name !== 'string' || street_name.trim() === '') {
            return NextResponse.json({ error: 'street_name is required' }, { status: 400 });
        }

        if (!issues || !Array.isArray(issues) || issues.length === 0) {
            return NextResponse.json({ error: 'issues must be a non-empty array' }, { status: 400 });
        }

        const snow = await db.query.snowRemovals.findFirst({
            where: eq(snowRemovals.id, id),
        });

        if (!snow) {
            return NextResponse.json({ error: 'Snow removal job not found' }, { status: 404 });
        }

        if (snow.status !== 'pending') {
            return NextResponse.json({ error: 'Snow removal job is already started or completed' }, { status: 400 });
        }

        await db.update(snowRemovals)
            .set({
                status: 'inspected',
                inspectedBy: user.id,
                inspectedAt: new Date(),
                streetName: street_name.trim(),
                houseNo: house_no ? String(house_no).trim() : null,
                issuesReported: JSON.stringify(issues),
                additionalComments: additional_comments ? String(additional_comments).trim() : null,
                capturedLatitude: captured_latitude != null ? String(captured_latitude) : null,
                capturedLongitude: captured_longitude != null ? String(captured_longitude) : null,
                updatedAt: new Date(),
            })
            .where(eq(snowRemovals.id, id));

        if (before_photos && Array.isArray(before_photos) && before_photos.length > 0) {
            await db.insert(jobPhotos).values(
                before_photos.map((url: string) => ({
                    jobType: 'snow',
                    jobId: id,
                    photoType: 'before',
                    photoUrl: url,
                    uploadedBy: user.id,
                }))
            );
        }

        await logAudit({
            userId: user.id,
            action: 'start_snow_removal',
            module: 'snow_removal',
            entityType: 'snow_removal',
            entityId: id,
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Start snow removal error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
