import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mealEntrySchema, nutritionProfileSchema } from "./nutrition.ts";

const base = { date: "2026-09-10", mealLabel: "Kahvaltı" };

describe("mealEntrySchema — mod ayrımı", () => {
  it("basit modda metin kabul eder", () => {
    const r = mealEntrySchema.safeParse({ ...base, mode: "SIMPLE", rawText: "Yumurta" });
    assert.equal(r.success, true);
  });

  it("basit modda besin değeri gönderilmesini REDDEDER", () => {
    const r = mealEntrySchema.safeParse({
      ...base, mode: "SIMPLE", rawText: "Yumurta", calories: 150, proteinG: 12,
    });
    assert.equal(r.success, false);
  });

  it("basit modda detaylı içerik gönderilmesini reddeder", () => {
    const r = mealEntrySchema.safeParse({
      ...base, mode: "SIMPLE", rawText: "Yumurta",
      foodItemsDetail: [{ name: "yumurta", amount: 2, unit: "adet" }],
    });
    assert.equal(r.success, false);
  });

  it("basit modda boş metni reddeder", () => {
    const r = mealEntrySchema.safeParse({ ...base, mode: "SIMPLE", rawText: "   " });
    assert.equal(r.success, false);
  });

  it("detaylı modda besin kalemi zorunlu", () => {
    const r = mealEntrySchema.safeParse({ ...base, mode: "DETAILED", calories: 300 });
    assert.equal(r.success, false);
  });

  it("detaylı modda kalem ve değerleri kabul eder", () => {
    const r = mealEntrySchema.safeParse({
      ...base, mode: "DETAILED",
      foodItemsDetail: [
        { name: "yumurta", amount: 2, unit: "adet", calories: 156, protein: 12.6, carbs: 1.1, fat: 10.6, fiber: 0 },
      ],
      calories: 156, proteinG: 12.6, carbsG: 1.1, fatG: 10.6, fiberG: 0,
    });
    assert.equal(r.success, true);
  });
});

describe("nutritionProfileSchema", () => {
  const valid = {
    mealsPerDay: 3,
    age: 30, heightCm: 180, weightKg: 80,
    trainingFrequency: "FOUR_TO_FIVE", trainingType: "Fitness", bodyGoal: "MUSCLE_GAIN",
    targetCalories: 3000, targetProteinG: 176, targetCarbsG: 330, targetFatG: 92,
  };

  it("geçerli profili kabul eder ve cinsiyet opsiyoneldir", () => {
    assert.equal(nutritionProfileSchema.safeParse(valid).success, true);
  });

  it("sınır dışı yaşı reddeder", () => {
    assert.equal(nutritionProfileSchema.safeParse({ ...valid, age: 5 }).success, false);
  });

  it("geçersiz öğün saatini reddeder", () => {
    const r = nutritionProfileSchema.safeParse({
      ...valid, mealTimes: [{ label: "Kahvaltı", time: "25:00" }],
    });
    assert.equal(r.success, false);
  });

  it("opsiyonel sağlık alanlarını kabul eder", () => {
    const r = nutritionProfileSchema.safeParse({
      ...valid, bloodType: "A Rh+", lastBloodTestDate: "2026-01-15", bloodTestReminderMonths: 6,
    });
    assert.equal(r.success, true);
  });
});
