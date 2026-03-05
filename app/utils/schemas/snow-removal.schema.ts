import { z } from "zod";
import { zoneTypeSchema } from "./zone.schema";

export const snowRemovalStatusSchema = z.enum(["pending", "inspected", "completed"]);

export const snowRemovalSchema = z.object({
    snowId: z.string().min(1),
    zoneId: z.string().uuid(),
    streetName: z.string().nullable(),
    avenueName: z.string().nullable(),
    zoneType: zoneTypeSchema,
    status: snowRemovalStatusSchema,
    notes: z.string().nullable(),
    createdAt: z.string(),
    inspectedAt: z.string().nullable(),
    completedAt: z.string().nullable(),
});

export type SnowRemovalFormData = z.infer<typeof snowRemovalSchema>;
export type SnowRemovalStatus = z.infer<typeof snowRemovalStatusSchema>;

export interface SnowRemoval extends SnowRemovalFormData {
    id: string;
    zone: {
        name: string;
        priority: string;
    };
}
