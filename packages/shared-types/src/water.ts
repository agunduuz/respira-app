import { z } from "zod";

const timeOfDaySchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "HH:MM formatında olmalı");

/** docs/06 varsayılanları — kullanıcı ayarlardan değiştirebilir. */
export const DEFAULT_WATER_WAKE_TIME = "08:00";
export const DEFAULT_WATER_SLEEP_TIME = "23:00";

/** docs/06 — genel hidrasyon literatüründe yaygın kaba tahmin formülü. */
export const WATER_ML_PER_KG = 33;

export const waterGoalSchema = z.object({
  dailyTargetMl: z.number().int().min(500).max(10000),
  /** Kullanıcı önerilen hedefi elle değiştirdiyse true — kiloya bağlı yeniden
   *  hesaplama bu hedefi sessizce ezmemeli (docs/04'teki macrosCustomized ile aynı desen). */
  isCustomized: z.boolean(),
  wakeTime: timeOfDaySchema,
  sleepTime: timeOfDaySchema,
});
export type WaterGoalInput = z.infer<typeof waterGoalSchema>;

export const logWaterIntakeSchema = z.object({
  amountMl: z.number().int().min(10).max(3000),
  loggedAt: z.string().datetime().optional(),
});
export type LogWaterIntakeInput = z.infer<typeof logWaterIntakeSchema>;

/** docs/06 — hızlı giriş butonları. */
export const WATER_QUICK_ADD_ML = [
  { label: "1 bardak", ml: 200 },
  { label: "0.5L şişe", ml: 500 },
  { label: "1L şişe", ml: 1000 },
  { label: "1.5L şişe", ml: 1500 },
] as const;
