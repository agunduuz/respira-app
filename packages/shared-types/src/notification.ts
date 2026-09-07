import { z } from "zod";

export const notificationCategorySchema = z.enum([
  "eye_strain",
  "water",
  "posture",
  "stress",
  "blood_test",
]);
export type NotificationCategory = z.infer<typeof notificationCategorySchema>;

// "HH:MM" — 24 saat formatı
const timeOfDaySchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "HH:MM formatında olmalı");

export const notificationPreferenceSchema = z.object({
  category: notificationCategorySchema,
  enabled: z.boolean(),
  frequencyMinutes: z.number().int().positive().max(24 * 60).nullable().optional(),
  quietHoursStart: timeOfDaySchema.nullable().optional(),
  quietHoursEnd: timeOfDaySchema.nullable().optional(),
});
export type NotificationPreferenceInput = z.infer<typeof notificationPreferenceSchema>;
