import { z } from "zod";

// "YYYY-MM-DD" — gün bazlı raporlar için tarih anahtarı
export const dateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD formatında olmalı");

export const dailyReportSchema = z.object({
  date: dateKeySchema,
  isFavorite: z.boolean().default(false),
  eyeStrainComplianceRate: z.number().min(0).max(1).nullable().optional(),
  totalWaterMl: z.number().int().nonnegative().nullable().optional(),
  totalCalories: z.number().int().nonnegative().nullable().optional(),
  totalProteinG: z.number().nonnegative().nullable().optional(),
  totalCarbsG: z.number().nonnegative().nullable().optional(),
  totalFatG: z.number().nonnegative().nullable().optional(),
  postureBreaksTaken: z.number().int().nonnegative().nullable().optional(),
  stressSessionsCompleted: z.number().int().nonnegative().nullable().optional(),
});
export type DailyReportInput = z.infer<typeof dailyReportSchema>;
