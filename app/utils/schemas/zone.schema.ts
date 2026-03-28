import { z } from "zod";

export const zoneTypeSchema = z.enum(["proposed", "additional"]);

export const latLngSchema = z.object({
    lat: z.number(),
    lng: z.number(),
});

export const zoneSchema = z.object({
    name: z.string().min(1, "Zone name is required"),
    zoneType: zoneTypeSchema,
    points: z.array(latLngSchema).min(2, "At least 2 points are required to create a zone"),
});

export type ZoneFormData = z.infer<typeof zoneSchema>;
export type ZoneType = z.infer<typeof zoneTypeSchema>;
export type LatLng = z.infer<typeof latLngSchema>;

export interface Zone extends ZoneFormData {
    id: string;
    isActive: boolean;
    totalPoints: number;
    createdAt: string;
}
