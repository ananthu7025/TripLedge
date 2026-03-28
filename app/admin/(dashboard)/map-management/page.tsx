/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/db";
import { desc } from "drizzle-orm";
import { zones } from "@/db/schema";
import { requireAuth } from "@/lib/utils/session";
import { type Zone } from "@/app/utils/schemas/zone.schema";
import { MapManagementClient } from "@/components/MapManagement";

export const metadata = {
  title: "Zone Management - Trip Ledge",
  description: "Manage work zones on the map",
};

export default async function MapManagementPage() {
  await requireAuth();

  const allZones = await db.query.zones.findMany({
    orderBy: [desc(zones.createdAt)],
  });

  const formattedZones: Zone[] = allZones.map((z) => ({
    id: z.id,
    name: z.name,
    zoneType: z.zoneType as any,
    points: JSON.parse(z.pointsGeojson),
    isActive: z.isActive ?? true,
    totalPoints: z.totalPoints ?? 0,
    createdAt: z.createdAt?.toISOString() || "",
  }));

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  return (
    <MapManagementClient
      initialZones={formattedZones}
      googleMapsApiKey={googleMapsApiKey}
    />
  );
}
