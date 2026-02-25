import { db } from "@/db";
import { desc } from "drizzle-orm";
import { targets } from "@/db/schema";
import { requireAuth } from "@/lib/utils/session";
import { TargetsClient } from "@/components/Targets/TargetsClient";

export const metadata = {
    title: "Targets - Trip Ledge",
    description: "Set and manage work targets for your team",
};

export default async function TargetsPage() {
    await requireAuth();

    const allTargets = await db.query.targets.findMany({
        orderBy: [desc(targets.createdAt)],
        with: {
            targetUsers: {
                with: {
                    user: {
                        columns: { id: true, fullName: true, email: true },
                    },
                },
            },
        },
    });

    // Serialize decimal fields to strings for client component
    const initialTargets = allTargets.map((t) => ({
        ...t,
        value: t.value?.toString() ?? "0",
        targetUsers: t.targetUsers.map((tu) => ({
            ...tu,
            allocatedValue: tu.allocatedValue?.toString() ?? "0",
        })),
    }));

    return <TargetsClient initialTargets={initialTargets} />;
}
