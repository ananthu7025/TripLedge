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
        orderBy: [desc(snowRemovals.createdAt)],
    });

    const formattedRemovals: SnowRemoval[] = removals.map((s) => ({
        id: s.id,
        snowId: s.snowId,
        streetName: s.streetName,
        houseNo: s.houseNo,
        status: s.status as any,
        crewMembers: s.crewMembers,
        issuesReported: s.issuesReported,
        additionalComments: s.additionalComments,
        toolsUsed: s.toolsUsed,
        materialsUsed: s.materialsUsed,
        solutionDescription: s.solutionDescription,
        createdAt: s.createdAt?.toISOString() || "",
        inspectedAt: s.inspectedAt?.toISOString() || null,
        completedAt: s.completedAt?.toISOString() || null,
    }));

    return (
        <SnowRemovalClient initialRemovals={formattedRemovals} />
    );
}
