import { z } from "zod";
import { zoneTypeSchema } from "./zone.schema";

export const tripInspectionStatusSchema = z.enum(["pending", "inspected", "completed"]);

export const tripInspectionSchema = z.object({
    tripId: z.string().min(1),
    zoneId: z.string().uuid(),
    streetName: z.string().nullable(),
    avenueName: z.string().nullable(),
    zoneType: zoneTypeSchema,
    status: tripInspectionStatusSchema,
    notes: z.string().nullable(),
    inspectedAt: z.string().nullable(),
    completedAt: z.string().nullable(),
});

export type TripInspectionFormData = z.infer<typeof tripInspectionSchema>;
export type TripInspectionStatus = z.infer<typeof tripInspectionStatusSchema>;

export interface TripInspection extends TripInspectionFormData {
    id: string;
    zone: {
        name: string;
        priority: string;
    };
}
