import { z } from "zod";

/**
 * Company Settings validation schema
 */
export const settingsSchema = z.object({
    companyName: z
        .string()
        .min(1, { message: "Company name is required" })
        .min(2, { message: "Company name must be at least 2 characters" }),
    city: z
        .string()
        .min(1, { message: "City/Region is required" }),
    officeAddress: z
        .string()
        .min(1, { message: "Office address is required" }),
    officeLatitude: z
        .string()
        .min(1, { message: "Latitude is required" })
        .refine((val) => !isNaN(parseFloat(val)), { message: "Latitude must be a valid number" }),
    officeLongitude: z
        .string()
        .min(1, { message: "Longitude is required" })
        .refine((val) => !isNaN(parseFloat(val)), { message: "Longitude must be a valid number" }),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
