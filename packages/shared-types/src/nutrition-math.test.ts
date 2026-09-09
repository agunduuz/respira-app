import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ACTIVITY_MULTIPLIER,
  KCAL_PER_G,
  calculateBmr,
  calculateMacroTargets,
  calculateTdee,
} from "./nutrition-math.ts";

describe("calculateBmr — Mifflin-St Jeor", () => {
  it("erkek formülünü doc'taki gibi uygular", () => {
    // 10×80 + 6.25×180 − 5×30 + 5 = 800 + 1125 − 150 + 5 = 1780
    const bmr = calculateBmr({
      age: 30, heightCm: 180, weightKg: 80, biologicalSex: "MALE",
      trainingFrequency: "NEVER", bodyGoal: "MAINTENANCE",
    });
    assert.equal(bmr, 1780);
  });

  it("kadın formülünü doc'taki gibi uygular", () => {
    // 10×60 + 6.25×165 − 5×30 − 161 = 600 + 1031.25 − 150 − 161 = 1320.25
    const bmr = calculateBmr({
      age: 30, heightCm: 165, weightKg: 60, biologicalSex: "FEMALE",
      trainingFrequency: "NEVER", bodyGoal: "MAINTENANCE",
    });
    assert.equal(bmr, 1320.25);
  });

  it("cinsiyet belirtilmezse iki sabitin ortasını kullanır", () => {
    const base = { age: 30, heightCm: 180, weightKg: 80,
      trainingFrequency: "NEVER" as const, bodyGoal: "MAINTENANCE" as const };
    const erkek = calculateBmr({ ...base, biologicalSex: "MALE" });
    const kadin = calculateBmr({ ...base, biologicalSex: "FEMALE" });
    const belirsiz = calculateBmr(base);
    assert.equal(belirsiz, (erkek + kadin) / 2);
    // Sapma payı her iki yöne de 83 kcal.
    assert.equal(erkek - belirsiz, 83);
  });

  it("null cinsiyeti de belirtilmemiş sayar", () => {
    const base = { age: 30, heightCm: 180, weightKg: 80,
      trainingFrequency: "NEVER" as const, bodyGoal: "MAINTENANCE" as const };
    assert.equal(calculateBmr({ ...base, biologicalSex: null }), calculateBmr(base));
  });
});

describe("calculateTdee", () => {
  it("aktivite çarpanını uygular", () => {
    const input = {
      age: 30, heightCm: 180, weightKg: 80, biologicalSex: "MALE" as const,
      trainingFrequency: "FOUR_TO_FIVE" as const, bodyGoal: "MAINTENANCE" as const,
    };
    assert.equal(calculateTdee(input), 1780 * 1.55);
  });

  it("doc'taki tüm çarpanları taşır", () => {
    assert.deepEqual(ACTIVITY_MULTIPLIER, {
      NEVER: 1.2, ONE_TO_TWO: 1.375, TWO_TO_THREE: 1.465, FOUR_TO_FIVE: 1.55, DAILY: 1.725,
    });
  });
});

describe("calculateMacroTargets", () => {
  const base = {
    age: 30, heightCm: 180, weightKg: 80, biologicalSex: "MALE" as const,
    trainingFrequency: "FOUR_TO_FIVE" as const,
  };

  it("sabit kalma hedefinde TDEE'yi korur", () => {
    const r = calculateMacroTargets({ ...base, bodyGoal: "MAINTENANCE" });
    assert.equal(r.targetCalories, Math.round(1780 * 1.55));
  });

  it("kilo vermede kalori açığı, kas kazanımında fazlası oluşturur", () => {
    const sabit = calculateMacroTargets({ ...base, bodyGoal: "MAINTENANCE" }).targetCalories;
    const kilo = calculateMacroTargets({ ...base, bodyGoal: "WEIGHT_LOSS" }).targetCalories;
    const kas = calculateMacroTargets({ ...base, bodyGoal: "MUSCLE_GAIN" }).targetCalories;
    assert.ok(kilo < sabit, "kilo verme TDEE'nin altında olmalı");
    assert.ok(kas > sabit, "kas kazanımı TDEE'nin üstünde olmalı");
    // docs/04: kilo vermede %15-20 aralığı
    const acikOrani = (sabit - kilo) / sabit;
    assert.ok(acikOrani >= 0.15 && acikOrani <= 0.20, `açık oranı aralık dışı: ${acikOrani}`);
  });

  it("protein hedefini vücut ağırlığından ve doc aralığından üretir", () => {
    for (const goal of ["MUSCLE_GAIN", "WEIGHT_LOSS", "FAT_LOSS", "ATHLETIC", "MAINTENANCE"] as const) {
      const r = calculateMacroTargets({ ...base, bodyGoal: goal });
      const gPerKg = r.targetProteinG / base.weightKg;
      assert.ok(gPerKg >= 1.6 && gPerKg <= 2.2, `${goal}: ${gPerKg} g/kg aralık dışı`);
    }
    // Kas kazanımında üst sınır (docs/04).
    assert.equal(calculateMacroTargets({ ...base, bodyGoal: "MUSCLE_GAIN" }).targetProteinG, 80 * 2.2);
  });

  it("yağı toplam kalorinin %25-30'u aralığında tutar", () => {
    const r = calculateMacroTargets({ ...base, bodyGoal: "MAINTENANCE" });
    const share = (r.targetFatG * KCAL_PER_G.fat) / r.targetCalories;
    assert.ok(share >= 0.25 && share <= 0.30, `yağ payı aralık dışı: ${share}`);
  });

  it("makro kalorileri toplam hedefe denk gelir", () => {
    const r = calculateMacroTargets({ ...base, bodyGoal: "MUSCLE_GAIN" });
    const toplam =
      r.targetProteinG * KCAL_PER_G.protein +
      r.targetCarbsG * KCAL_PER_G.carbs +
      r.targetFatG * KCAL_PER_G.fat;
    // Yuvarlama payı: her makro 0.1 g hassasiyetinde.
    assert.ok(Math.abs(toplam - r.targetCalories) < 5, `sapma ${toplam - r.targetCalories} kcal`);
  });

  it("aşırı senaryoda karbonhidratı negatife düşürmez", () => {
    // Çok ağır ve hareketsiz + agresif açık: protein tek başına kaloriyi zorlar.
    const r = calculateMacroTargets({
      age: 70, heightCm: 150, weightKg: 150, biologicalSex: "FEMALE",
      trainingFrequency: "NEVER", bodyGoal: "WEIGHT_LOSS",
    });
    assert.ok(r.targetCarbsG >= 0, `karbonhidrat negatif: ${r.targetCarbsG}`);
  });
});
