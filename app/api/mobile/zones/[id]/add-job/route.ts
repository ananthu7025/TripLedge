import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { zones, tripInspections, snowRemovals, jobPhotos } from '@/db/schema';
import { requireMobileAuth } from '@/lib/utils/session';
import { logAudit } from '@/lib/utils/audit';
import { generateTripId, generateSnowId } from '@/lib/utils/generators';
import { eq } from 'drizzle-orm';

// POST /api/mobile/zones/:id/add-job
// Technician arrives at zone start point, creates the trip/snow job(s) on-site
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireMobileAuth();
        const { id } = await params;
        const body = await request.json();

        const {
            street_name,
            avenue_name,
            high_point,
            low_point,
            length,
            captured_latitude,
            captured_longitude,
            before_photos,
            problem_description,
        } = body;

        if (!street_name || typeof street_name !== 'string' || street_name.trim() === '') {
            return NextResponse.json({ error: 'street_name is required' }, { status: 400 });
        }

        if (!before_photos || !Array.isArray(before_photos) || before_photos.length === 0) {
            return NextResponse.json({ error: 'before_photos must be a non-empty array' }, { status: 400 });
        }

        // Look up the zone
        const zone = await db.query.zones.findFirst({
            where: eq(zones.id, id),
        });

        if (!zone) {
            return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
        }

        // Snow jobs require a problem description
        if ((zone.module === 'snow' || zone.module === 'both') &&
            (!problem_description || typeof problem_description !== 'string' || problem_description.trim() === '')) {
            return NextResponse.json({ error: 'problem_description is required for snow jobs' }, { status: 400 });
        }

        const jobsCreated: { type: string; id: string; jobId: string }[] = [];
        const now = new Date();

        // Create trip inspection job if applicable
        if (zone.module === 'trip' || zone.module === 'both') {
            const tripId = await generateTripId();
            const [trip] = await db.insert(tripInspections).values({
                tripId,
                zoneId: zone.id,
                zoneType: zone.zoneType,
                status: 'inspected',
                inspectedBy: user.id,
                inspectedAt: now,
                streetName: street_name.trim(),
                avenueName: avenue_name ? String(avenue_name).trim() : null,
                highPoint: high_point != null ? String(high_point) : null,
                lowPoint: low_point != null ? String(low_point) : null,
                length: length != null ? String(length) : null,
                capturedLatitude: captured_latitude != null ? String(captured_latitude) : null,
                capturedLongitude: captured_longitude != null ? String(captured_longitude) : null,
                createdBy: user.id,
            }).returning();

            await db.insert(jobPhotos).values(
                before_photos.map((url: string) => ({
                    jobType: 'trip',
                    jobId: trip.id,
                    photoType: 'before',
                    photoUrl: url,
                    uploadedBy: user.id,
                }))
            );

            jobsCreated.push({ type: 'trip', id: trip.id, jobId: trip.tripId });
        }

        // Create snow removal job — created as 'inspected' (before photos + problem collected at add time)
        if (zone.module === 'snow' || zone.module === 'both') {
            const snowId = await generateSnowId();
            const [snow] = await db.insert(snowRemovals).values({
                snowId,
                zoneId: zone.id,
                zoneType: zone.zoneType,
                status: 'inspected',
                inspectedBy: user.id,
                inspectedAt: now,
                streetName: street_name.trim(),
                capturedLatitude: captured_latitude != null ? String(captured_latitude) : null,
                capturedLongitude: captured_longitude != null ? String(captured_longitude) : null,
                problemDescription: problem_description.trim(),
                createdBy: user.id,
            }).returning();

            await db.insert(jobPhotos).values(
                before_photos.map((url: string) => ({
                    jobType: 'snow',
                    jobId: snow.id,
                    photoType: 'before',
                    photoUrl: url,
                    uploadedBy: user.id,
                }))
            );

            jobsCreated.push({ type: 'snow', id: snow.id, jobId: snow.snowId });
        }

        await logAudit({
            userId: user.id,
            action: 'add_job_from_zone',
            module: 'zones',
            entityType: 'zone',
            entityId: zone.id,
            metadata: { zoneName: zone.name, jobsCreated },
        });

        return NextResponse.json({ success: true, jobsCreated });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Add job from zone error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
