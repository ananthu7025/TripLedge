import { db } from "@/db";
import { users, roles } from "@/db/schema";
import { requireAuth } from "@/lib/utils/session";
import { UsersClient } from "@/components/Users/UsersClient";
import { desc } from "drizzle-orm";

export const metadata = {
    title: "Users - Trip Ledge",
    description: "Manage team members and access",
};

export default async function UsersPage() {
    await requireAuth();

    const [allUsers, allRoles] = await Promise.all([
        db.query.users.findMany({
            orderBy: [desc(users.createdAt)],
            with: {
                role: {
                    columns: { id: true, name: true, description: true },
                },
            },
        }),
        db.query.roles.findMany(),
    ]);

    const initialUsers = allUsers.map((u) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        status: u.status,
        role: {
            id: u.role.id,
            name: u.role.name,
            description: u.role.description ?? "",
        },
    }));

    const initialRoles = allRoles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description ?? "",
    }));

    return <UsersClient initialUsers={initialUsers} initialRoles={initialRoles} />;
}
