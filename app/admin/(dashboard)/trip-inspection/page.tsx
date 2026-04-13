import { db } from "@/db";
import { desc } from "drizzle-orm";
import { tripInspections } from "@/db/schema";
import { requireAuth } from "@/lib/utils/session";
import { TripInspectionClient } from "@/components/TripInspection/TripInspectionClient";
import { type TripInspection } from "@/app/utils/schemas/trip-inspection.schema";

export const metadata = {
    title: "Trip Inspection - Trip Ledge",
    description: "Manage trip inspections and grinding tasks",
};

export default async function TripInspectionPage() {
    await requireAuth();

    const inspections = await db.query.tripInspections.findMany({
        with: {
            zone: {
                columns: {
                    name: true,
                }
            }
        },
        orderBy: [desc(tripInspections.createdAt)],
    });

    const formattedTrips: TripInspection[] = inspections.map((t) => ({
        id: t.id,
        tripId: t.tripId,
        zoneId: t.zoneId,
        streetName: t.streetName,
        houseNo: t.houseNo,
        status: t.status as any,
        notes: t.notes,
        inspectedUsers: t.inspectedUsers,
        completedUsers: t.completedUsers,
        capturedLatitude: t.capturedLatitude?.toString() || null,
        capturedLongitude: t.capturedLongitude?.toString() || null,
        highPoint: t.highPoint?.toString() || null,
        lowPoint: t.lowPoint?.toString() || null,
        length: t.length?.toString() || null,
        inspectedAt: t.inspectedAt?.toISOString() || null,
        completedAt: t.completedAt?.toISOString() || null,
        zone: t.zone ? { name: t.zone.name } : null,
    }));

    return (
        <TripInspectionClient initialTrips={formattedTrips} />
    );
}
