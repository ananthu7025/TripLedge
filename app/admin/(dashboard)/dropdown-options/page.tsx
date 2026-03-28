import { db } from "@/db";
import { requireAuth } from "@/lib/utils/session";
import { dropdownOptions } from "@/db/schema";
import { asc } from "drizzle-orm";
import { DropdownOptionsClient } from "@/components/DropdownOptions/DropdownOptionsClient";

export const metadata = {
    title: "Dropdown Options - Trip Ledge",
};

export default async function DropdownOptionsPage() {
    await requireAuth();
    const options = await db.select().from(dropdownOptions)
        .orderBy(asc(dropdownOptions.category), asc(dropdownOptions.sortOrder));
    return <DropdownOptionsClient initialOptions={options} />;
}
