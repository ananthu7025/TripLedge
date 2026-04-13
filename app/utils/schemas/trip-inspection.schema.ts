import { z } from "zod";

export const tripInspectionStatusSchema = z.enum(["pending", "inspected", "completed"]);

export const tripInspectionSchema = z.object({
    tripId: z.string().min(1),
    zoneId: z.string().uuid(),
    streetName: z.string().nullable(),
    houseNo: z.string().nullable(),
    status: tripInspectionStatusSchema,
    notes: z.string().nullable(),
    inspectedUsers: z.string().nullable().optional(),
    completedUsers: z.string().nullable().optional(),
    capturedLatitude: z.string().nullable().optional(),
    capturedLongitude: z.string().nullable().optional(),
    highPoint: z.string().nullable().optional(),
    lowPoint: z.string().nullable().optional(),
    length: z.string().nullable().optional(),
    inspectedAt: z.string().nullable(),
    completedAt: z.string().nullable(),
});

export type TripInspectionFormData = z.infer<typeof tripInspectionSchema>;
export type TripInspectionStatus = z.infer<typeof tripInspectionStatusSchema>;

export interface TripInspection extends TripInspectionFormData {
    id: string;
    zone: {
        name: string;
    };
}
