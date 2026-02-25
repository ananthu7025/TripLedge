import { db } from "@/db";
import { desc } from "drizzle-orm";
import { snowRemovals } from "@/db/schema";
import { requireAuth } from "@/lib/utils/session";
import { SnowRemovalClient } from "@/components/SnowRemoval/SnowRemovalClient";
import { type SnowRemoval } from "@/app/utils/schemas/snow-removal.schema";

export const metadata = {
    title: "Snow Removal - Trip Ledge",
    description: "Manage snow removal operations",
};

export default async function SnowRemovalPage() {
    await requireAuth();

    const removals = await db.query.snowRemovals.findMany({
        with: {
            zone: {
                columns: {
                    name: true,
                    priority: true,
                }
            }
        },
        orderBy: [desc(snowRemovals.createdAt)],
    });

    const formattedRemovals: SnowRemoval[] = removals.map((s) => ({
        id: s.id,
        snowId: s.snowId,
        placeName: s.placeName,
        locationDetails: s.locationDetails,
        zoneType: s.zoneType as any,
        status: s.status as any,
        notes: s.notes,
        createdAt: s.createdAt?.toISOString() || "",
        completedAt: s.completedAt?.toISOString() || null,
        zoneId: s.zoneId,
        zone: {
            name: s.zone.name,
            priority: s.zone.priority,
        }
    }));

    return (
        <SnowRemovalClient initialRemovals={formattedRemovals} />
    );
}
