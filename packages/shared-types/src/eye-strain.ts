import { z } from "zod";

/** docs/03 — 20-20-20 kuralı; kullanıcı iki değeri de bağımsız değiştirebilir. */
export const eyeStrainSettingsSchema = z.object({
  // Alt sınır 1 dk: daha kısası bildirim planını anlamsızca doldurur.
  // Üst sınır 180 dk: bunun ötesi "hatırlatma" olmaktan çıkar.
  intervalMinutes: z.number().int().min(1).max(180),
  breakSeconds: z.number().int().min(5).max(300),
});
export type EyeStrainSettingsInput = z.infer<typeof eyeStrainSettingsSchema>;

export const EYE_STRAIN_DEFAULTS: EyeStrainSettingsInput = {
  intervalMinutes: 20,
  breakSeconds: 20,
};

export const eyeStrainStatusSchema = z.enum(["COMPLETED", "SKIPPED", "MISSED"]);
export type EyeStrainStatus = z.infer<typeof eyeStrainStatusSchema>;

export const recordEyeStrainSessionSchema = z.object({
  status: eyeStrainStatusSchema,
  /**
   * Molanın tetiklendiği an. İstemci bunu gönderiyor çünkü uygulama kapalıyken
   * kaçırılan molalar sonradan toplu olarak bildirilebiliyor — sunucu saatini
   * kullanmak o kayıtları yanlış güne yazardı.
   */
  triggeredAt: z.string().datetime(),
});
export type RecordEyeStrainSessionInput = z.infer<typeof recordEyeStrainSessionSchema>;

/** Birden fazla kaçırılan molayı tek istekte bildirmek için. */
export const recordEyeStrainSessionsSchema = z.object({
  sessions: z.array(recordEyeStrainSessionSchema).min(1).max(100),
});
export type RecordEyeStrainSessionsInput = z.infer<typeof recordEyeStrainSessionsSchema>;

export const eyeStrainPeriodSchema = z.enum(["daily", "weekly", "monthly"]);

/**
 * IANA saat dilimi ("Europe/Istanbul"). Gün sınırları kullanıcının yerel
 * saatine göre hesaplanmalı — UTC'ye göre bölmek, gece 01:00'daki bir molayı
 * bir önceki güne yazardı.
 */
export const timeZoneSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z][A-Za-z0-9_+-]*(\/[A-Za-z0-9_+-]+)*$/, "Geçersiz saat dilimi");
export type EyeStrainPeriod = z.infer<typeof eyeStrainPeriodSchema>;

export const eyeStrainBucketSchema = z.object({
  /** "YYYY-MM-DD" — günlük raporda saat dilimi, diğerlerinde gün. */
  key: z.string(),
  completed: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
  missed: z.number().int().nonnegative(),
  /** 0-1 arası; hiç mola tetiklenmediyse null (0 ile karıştırılmamalı). */
  complianceRate: z.number().min(0).max(1).nullable(),
});
export type EyeStrainBucket = z.infer<typeof eyeStrainBucketSchema>;

export const eyeStrainAnalyticsSchema = z.object({
  period: eyeStrainPeriodSchema,
  from: z.string(),
  to: z.string(),
  totals: z.object({
    triggered: z.number().int().nonnegative(),
    completed: z.number().int().nonnegative(),
    skipped: z.number().int().nonnegative(),
    missed: z.number().int().nonnegative(),
    complianceRate: z.number().min(0).max(1).nullable(),
  }),
  buckets: z.array(eyeStrainBucketSchema),
});
export type EyeStrainAnalytics = z.infer<typeof eyeStrainAnalyticsSchema>;

/**
 * Uyum oranı = tamamlanan / tetiklenen.
 * Atlanan ve kaçırılan ikisi de "uyulmadı" sayılır — kullanıcı molayı bilerek
 * atlamış da olsa gözü dinlenmemiştir.
 *
 * Hiç mola tetiklenmemişse oran 0 değil null: "veri yok" ile "hiç uymadı"
 * grafikte de metinde de aynı şey değil.
 */
export function complianceRate(counts: {
  completed: number;
  skipped: number;
  missed: number;
}): number | null {
  const triggered = counts.completed + counts.skipped + counts.missed;
  if (triggered === 0) return null;
  return counts.completed / triggered;
}
