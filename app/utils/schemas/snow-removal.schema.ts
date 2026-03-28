import { z } from "zod";

export const snowRemovalStatusSchema = z.enum(["pending", "inspected", "completed"]);

export const snowRemovalSchema = z.object({
    snowId: z.string().min(1),
    streetName: z.string().nullable(),
    houseNo: z.string().nullable(),
    status: snowRemovalStatusSchema,
    createdAt: z.string(),
    inspectedAt: z.string().nullable(),
    completedAt: z.string().nullable(),
});

export type SnowRemovalFormData = z.infer<typeof snowRemovalSchema>;
export type SnowRemovalStatus = z.infer<typeof snowRemovalStatusSchema>;

export interface SnowRemoval extends SnowRemovalFormData {
    id: string;
}
