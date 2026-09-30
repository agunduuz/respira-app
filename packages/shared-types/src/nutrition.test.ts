import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mealEntrySchema, defaultMealLabels, nutritionProfileSchema, sumFoodItems, suggestMealLabel } from "./nutrition.ts";

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

describe("sumFoodItems", () => {
  it("kalemleri toplar, kaloriyi tam sayıya yuvarlar", () => {
    const t = sumFoodItems([
      { name: "Yumurta", amount: 2, unit: "adet", calories: 143.4, protein: 12.6, carbs: 0.7, fat: 9.5 },
      { name: "Simit", amount: 1, unit: "adet", calories: 280.3, protein: 9, carbs: 50.2, fat: 5.1, fiber: 2 },
    ]);
    assert.deepEqual(t, {
      calories: 424,
      proteinG: 21.6,
      carbsG: 50.9,
      fatG: 14.6,
      fiberG: 2,
    });
  });

  it("hiçbir kalemde girilmeyen değer null kalır, 0 olmaz", () => {
    const t = sumFoodItems([{ name: "Zeytin", amount: 30, unit: "g", calories: 40 }]);
    assert.equal(t.calories, 40);
    assert.equal(t.proteinG, null);
    assert.equal(t.fiberG, null);
  });

  it("boş liste tamamen null döner", () => {
    assert.equal(sumFoodItems([]).calories, null);
  });
});

describe("defaultMealLabels", () => {
  it("4 öğünde Sabah, Öğlen, Ara öğün, Akşam verir", () => {
    assert.deepEqual(defaultMealLabels(4), ["Sabah", "Öğlen", "Ara öğün", "Akşam"]);
  });

  it("her sayı için adlar benzersiz ve sayıya eşit", () => {
    for (let n = 1; n <= 8; n++) {
      const labels = defaultMealLabels(n);
      assert.equal(labels.length, n);
      assert.equal(new Set(labels).size, n);
    }
  });

  it("aralık dışı değerleri sınırlar", () => {
    assert.equal(defaultMealLabels(0).length, 1);
    assert.equal(defaultMealLabels(20).length, 8);
  });
});

describe("suggestMealLabel", () => {
  it("eklenmemiş ilk öğünü önerir", () => {
    assert.equal(suggestMealLabel(4, []), "Sabah");
    assert.equal(suggestMealLabel(4, ["Sabah"]), "Öğlen");
  });

  it("eski Kahvaltı kaydını Sabah sayar", () => {
    assert.equal(suggestMealLabel(3, ["Kahvaltı"]), "Öğlen");
  });

  it("öğün atlanmışsa boşta kalanı önerir", () => {
    assert.equal(suggestMealLabel(3, ["Öğlen"]), "Sabah");
  });

  it("hepsi eklenmişse Ara öğün döner", () => {
    assert.equal(suggestMealLabel(2, ["Sabah", "Akşam"]), "Ara öğün");
  });
});
