import { z } from "zod";

export const snowRemovalStatusSchema = z.enum(["pending", "inspected", "completed"]);

export const snowRemovalSchema = z.object({
    snowId: z.string().min(1),
    streetName: z.string().nullable(),
    houseNo: z.string().nullable(),
    status: snowRemovalStatusSchema,
    crewMembers: z.string().nullable().optional(),
    issuesReported: z.string().nullable().optional(),
    additionalComments: z.string().nullable().optional(),
    toolsUsed: z.string().nullable().optional(),
    materialsUsed: z.string().nullable().optional(),
    solutionDescription: z.string().nullable().optional(),
    createdAt: z.string(),
    inspectedAt: z.string().nullable(),
    completedAt: z.string().nullable(),
});

export type SnowRemovalFormData = z.infer<typeof snowRemovalSchema>;
export type SnowRemovalStatus = z.infer<typeof snowRemovalStatusSchema>;

export interface SnowRemoval extends SnowRemovalFormData {
    id: string;
}
