import { z } from "zod";

export const workStyleSchema = z.enum(["SEDENTARY", "STANDING_ACTIVE", "MIXED"]);
export const workIntensitySchema = z.enum(["LIGHT", "MODERATE", "HEAVY"]);
export const breakStatusSchema = z.enum(["COMPLETED", "SKIPPED", "MISSED"]);
export type BreakStatus = z.infer<typeof breakStatusSchema>;

const timeOfDaySchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "HH:MM formatında olmalı");

/** docs/05 onboarding formu. */
export const postureProfileSchema = z.object({
  workStyle: workStyleSchema,
  workIntensity: workIntensitySchema,
  /** Ekran başında zorunlu çalışma varsa günde kaç saat; yoksa null. */
  screenHoursPerDay: z.number().int().min(0).max(24).nullable().optional(),
  occupationType: z.string().min(1).max(60),
  /** Saat başı kendine ayırabileceği dakika. */
  minutesPerHourAvailable: z.number().int().min(1).max(30),
  workHoursStart: timeOfDaySchema.nullable().optional(),
  workHoursEnd: timeOfDaySchema.nullable().optional(),
});
export type PostureProfileInput = z.infer<typeof postureProfileSchema>;

export const recordPostureBreakSchema = z.object({
  status: breakStatusSchema,
  triggeredAt: z.string().datetime(),
  exerciseSetId: z.string().max(80).nullable().optional(),
});
export type RecordPostureBreakInput = z.infer<typeof recordPostureBreakSchema>;

export const recordPostureBreaksSchema = z.object({
  breaks: z.array(recordPostureBreakSchema).min(1).max(100),
});

/** docs/05'te önerilen hazır süre seçenekleri. */
export const POSTURE_MINUTE_PRESETS = [2, 5, 8] as const;

export const OCCUPATION_TYPES = [
  "Yazılım/Ofis",
  "Sağlık",
  "Perakende/Ayakta hizmet",
  "Üretim/Fiziksel iş",
  "Diğer",
] as const;
