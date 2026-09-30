import { z } from "zod";

import { dateKeySchema } from "./daily-report.ts";

export const biologicalSexSchema = z.enum(["MALE", "FEMALE"]);
export const trainingFrequencySchema = z.enum([
  "NEVER",
  "ONE_TO_TWO",
  "TWO_TO_THREE",
  "FOUR_TO_FIVE",
  "DAILY",
]);
export const bodyGoalSchema = z.enum([
  "ATHLETIC",
  "MUSCLE_GAIN",
  "WEIGHT_LOSS",
  "MAINTENANCE",
  "FAT_LOSS",
]);
export const mealModeSchema = z.enum(["SIMPLE", "DETAILED"]);
export type MealModeValue = z.infer<typeof mealModeSchema>;

const timeOfDaySchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "HH:MM formatında olmalı");

export const mealTimeSchema = z.object({
  label: z.string().min(1).max(40),
  time: timeOfDaySchema,
});

/** Adım 1 — öğün düzeni. docs/04: 3'ten fazla öğünde saatler opsiyonel tanımlanabilir. */
export const nutritionStep1Schema = z.object({
  mealsPerDay: z.number().int().min(1).max(8),
  mealTimes: z.array(mealTimeSchema).max(8).nullable().optional(),
});

/** Adım 2 — fiziksel profil. */
export const nutritionStep2Schema = z.object({
  age: z.number().int().min(10).max(120),
  heightCm: z.number().min(80).max(260),
  weightKg: z.number().min(25).max(400),
  biologicalSex: biologicalSexSchema.nullable().optional(),
  trainingFrequency: trainingFrequencySchema,
  trainingType: z.string().min(1).max(40),
  bodyGoal: bodyGoalSchema,
  bodyFatPercent: z.number().min(1).max(70).nullable().optional(),
  measurements: z
    .object({
      neck: z.number().min(10).max(100).nullable().optional(),
      arm: z.number().min(10).max(100).nullable().optional(),
      waist: z.number().min(30).max(250).nullable().optional(),
      hip: z.number().min(30).max(250).nullable().optional(),
    })
    .nullable()
    .optional(),
});

/** Adım 3 — makro hedefleri. Otomatik hesaplanır, kullanıcı değiştirebilir. */
export const nutritionStep3Schema = z.object({
  targetCalories: z.number().int().min(800).max(8000),
  targetProteinG: z.number().min(0).max(500),
  targetCarbsG: z.number().min(0).max(1000),
  targetFatG: z.number().min(0).max(400),
  macrosCustomized: z.boolean().default(false),
});

/** Adım 4 — sağlık bilgileri, hepsi opsiyonel (KVKK veri asgarileştirmesi). */
export const nutritionStep4Schema = z.object({
  bloodType: z.string().max(8).nullable().optional(),
  sugarNeedRate: z.string().max(120).nullable().optional(),
  lastBloodTestDate: dateKeySchema.nullable().optional(),
  bloodTestReminderMonths: z.number().int().min(1).max(60).nullable().optional(),
});

export const nutritionProfileSchema = nutritionStep1Schema
  .extend(nutritionStep2Schema.shape)
  .extend(nutritionStep3Schema.shape)
  .extend(nutritionStep4Schema.shape);

export type NutritionProfileInput = z.infer<typeof nutritionProfileSchema>;

export const foodItemSchema = z.object({
  name: z.string().min(1).max(80),
  amount: z.number().positive().max(10000),
  unit: z.string().min(1).max(16), // "g", "adet", "ml"
  calories: z.number().min(0).max(10000).nullable().optional(),
  protein: z.number().min(0).max(500).nullable().optional(),
  carbs: z.number().min(0).max(1000).nullable().optional(),
  fat: z.number().min(0).max(500).nullable().optional(),
  fiber: z.number().min(0).max(200).nullable().optional(),
});

/**
 * Öğün kaydı.
 *
 * docs/04: basit modda besin değeri hesaplaması YAPILMAZ. Bu yüzden şema
 * SIMPLE modda sayısal alanlara izin vermiyor — istemcinin yanlışlıkla
 * sayı göndermesi sessizce kabul edilip sonra "detaylı veri" sanılmasın.
 */
export const mealEntrySchema = z
  .object({
    date: dateKeySchema,
    mealLabel: z.string().min(1).max(40),
    mode: mealModeSchema,
    rawText: z.string().max(2000).nullable().optional(),
    foodItemsDetail: z.array(foodItemSchema).max(50).nullable().optional(),
    calories: z.number().int().min(0).max(20000).nullable().optional(),
    proteinG: z.number().min(0).max(1000).nullable().optional(),
    carbsG: z.number().min(0).max(2000).nullable().optional(),
    fatG: z.number().min(0).max(1000).nullable().optional(),
    fiberG: z.number().min(0).max(500).nullable().optional(),
    isFavorite: z.boolean().default(false),
  })
  .superRefine((v, ctx) => {
    const hasNumbers =
      v.calories != null ||
      v.proteinG != null ||
      v.carbsG != null ||
      v.fatG != null ||
      v.fiberG != null;

    if (v.mode === "SIMPLE") {
      if (hasNumbers || (v.foodItemsDetail && v.foodItemsDetail.length > 0)) {
        ctx.addIssue({
          code: "custom",
          message: "Basit modda besin değeri veya detaylı içerik gönderilemez",
          path: ["mode"],
        });
      }
      if (!v.rawText || v.rawText.trim().length === 0) {
        ctx.addIssue({ code: "custom", message: "Basit modda metin zorunlu", path: ["rawText"] });
      }
    } else {
      if (!v.foodItemsDetail || v.foodItemsDetail.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "Detaylı modda en az bir besin kalemi gerekli",
          path: ["foodItemsDetail"],
        });
      }
    }
  });

export type MealEntryInput = z.infer<typeof mealEntrySchema>;

export const toggleFavoriteSchema = z.object({ isFavorite: z.boolean() });

export const nutritionPeriodSchema = z.enum(["daily", "weekly", "monthly"]);
export type NutritionPeriod = z.infer<typeof nutritionPeriodSchema>;

export type FoodItemInput = z.infer<typeof foodItemSchema>;

export interface MealTotals {
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  fiberG: number | null;
}

/**
 * Öğündeki kalemlerin toplamı (UX-006). Bir değer hiçbir kalemde girilmemişse
 * 0 değil null döner: "bilinmiyor" ile "sıfır" karışmasın. Bir kalemde boş
 * olması ise toplamı bozmaz, o kalem o değere 0 katkı yapar.
 */
export function sumFoodItems(items: readonly FoodItemInput[]): MealTotals {
  const add = (pick: (i: FoodItemInput) => number | null | undefined): number | null => {
    let sum = 0;
    let any = false;
    for (const item of items) {
      const v = pick(item);
      if (v != null) {
        sum += v;
        any = true;
      }
    }
    return any ? Math.round(sum * 10) / 10 : null;
  };
  const calories = add((i) => i.calories);
  return {
    calories: calories === null ? null : Math.round(calories),
    proteinG: add((i) => i.protein),
    carbsG: add((i) => i.carbs),
    fatG: add((i) => i.fat),
    fiberG: add((i) => i.fiber),
  };
}

const MEAL_LABELS_BY_COUNT: Record<number, readonly string[]> = {
  1: ["Ana öğün"],
  2: ["Sabah", "Akşam"],
  3: ["Sabah", "Öğlen", "Akşam"],
  4: ["Sabah", "Öğlen", "Ara öğün", "Akşam"],
  5: ["Sabah", "Ara öğün 1", "Öğlen", "Ara öğün 2", "Akşam"],
  6: ["Sabah", "Ara öğün 1", "Öğlen", "Ara öğün 2", "Akşam", "Gece"],
  7: ["Sabah", "Ara öğün 1", "Öğlen", "Ara öğün 2", "Akşam", "Ara öğün 3", "Gece"],
  8: ["Sabah", "Ara öğün 1", "Öğlen", "Ara öğün 2", "Ara öğün 3", "Akşam", "Ara öğün 4", "Gece"],
};

/**
 * Günlük öğün sayısına göre seçilebilir öğün adları (UX-007), gün içindeki
 * sırayla. Adlar birbirinden farklı: ara öğün birden çoksa numaralanıyor,
 * böylece her ad seçim listesinde tek bir değer olarak durabiliyor.
 */
export function defaultMealLabels(mealsPerDay: number): string[] {
  const n = Math.min(8, Math.max(1, Math.round(mealsPerDay)));
  return [...MEAL_LABELS_BY_COUNT[n]];
}

/** Eski kayıtlardaki "Kahvaltı"/"Öğle" adları yeni "Sabah"/"Öğlen" ile aynı öğün sayılır. */
function canonicalMealLabel(label: string): string {
  const l = label.trim().toLocaleLowerCase("tr-TR");
  if (l === "kahvaltı") return "sabah";
  if (l === "öğle") return "öğlen";
  return l;
}

/**
 * Bugün henüz eklenmemiş ilk varsayılan öğün. Yalnızca ÖNSEÇİM için: kullanıcı
 * ekranda istediği öğünü seçebilir. Hepsi eklenmişse "Ara öğün" döner.
 */
export function suggestMealLabel(mealsPerDay: number, loggedLabels: readonly string[]): string {
  const logged = new Set(loggedLabels.map(canonicalMealLabel));
  return defaultMealLabels(mealsPerDay).find((l) => !logged.has(canonicalMealLabel(l))) ?? "Ara öğün";
}
