import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { requireAuth } from "@/lib/utils/session";
import { SettingsClient } from "@/components/Settings/SettingsClient";

export const metadata = {
    title: "Settings - Trip Ledge",
    description: "Manage your profile and company settings",
};

export default async function SettingsPage() {
    const user = await requireAuth();

    // Fetch Company Settings
    const settingsData = await db.query.companySettings.findFirst();
    const initialSettings = {
        companyName: settingsData?.companyName || "Trip Ledge",
        city: settingsData?.city || "North Battleford, SK",
        officeAddress: settingsData?.officeAddress || "",
        officeLatitude: settingsData?.officeLatitude?.toString() || "",
        officeLongitude: settingsData?.officeLongitude?.toString() || "",
        difficultyWeight: (settingsData as any)?.difficultyWeight?.toString() || "0.2",
    };

    // Fetch User Profile
    const userData = await db.query.users.findFirst({
        where: eq(users.id, user.id)
    });

    const initialProfile = {
        fullName: userData?.fullName || user.fullName,
        email: userData?.email || user.email
    };

    return (
        <SettingsClient
            initialSettings={initialSettings}
            initialProfile={initialProfile}
        />
    );
}
