import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { snowRemovals, jobPhotos } from '@/db/schema';
import { requireMobileAuth } from '@/lib/utils/session';
import { logAudit } from '@/lib/utils/audit';
import { generateSnowId } from '@/lib/utils/generators';
import { eq, or, desc } from 'drizzle-orm';

// POST /api/mobile/snow-removals — technician creates a snow job directly from the field
export async function POST(request: NextRequest) {
    try {
        const user = await requireMobileAuth();
        const body = await request.json();

        const {
            street_name,
            house_no,
            issues,
            additional_comments,
            before_photos,
            captured_latitude,
            captured_longitude,
        } = body;

        if (!street_name || typeof street_name !== 'string' || street_name.trim() === '') {
            return NextResponse.json({ error: 'street_name is required' }, { status: 400 });
        }

        if (!issues || !Array.isArray(issues) || issues.length === 0) {
            return NextResponse.json({ error: 'issues must be a non-empty array' }, { status: 400 });
        }

        const snowId = await generateSnowId();
        const now = new Date();

        const [snow] = await db.insert(snowRemovals).values({
            snowId,
            status: 'inspected',
            inspectedBy: user.id,
            inspectedAt: now,
            streetName: street_name.trim(),
            houseNo: house_no ? String(house_no).trim() : null,
            issuesReported: JSON.stringify(issues),
            additionalComments: additional_comments ? String(additional_comments).trim() : null,
            capturedLatitude: captured_latitude != null ? String(captured_latitude) : null,
            capturedLongitude: captured_longitude != null ? String(captured_longitude) : null,
            createdBy: user.id,
        }).returning();

        if (before_photos && Array.isArray(before_photos) && before_photos.length > 0) {
            await db.insert(jobPhotos).values(
                before_photos.map((url: string) => ({
                    jobType: 'snow',
                    jobId: snow.id,
                    photoType: 'before',
                    photoUrl: url,
                    uploadedBy: user.id,
                }))
            );
        }

        await logAudit({
            userId: user.id,
            action: 'create_snow_removal',
            module: 'snow_removal',
            entityType: 'snow_removal',
            entityId: snow.id,
        });

        return NextResponse.json({ success: true, id: snow.id, snowId: snow.snowId });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Create snow removal error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        await requireMobileAuth();

        const snows = await db.query.snowRemovals.findMany({
            where: or(
                eq(snowRemovals.status, 'pending'),
                eq(snowRemovals.status, 'inspected'),
                eq(snowRemovals.status, 'completed')
            ),
            orderBy: [desc(snowRemovals.createdAt)],
        });

        return NextResponse.json({ snows });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Fetch mobile snow removals error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
