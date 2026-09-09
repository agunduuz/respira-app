import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DIETITIAN_DISCLAIMER,
  previousDayReference,
  suggestNextMeal,
} from "./nutrition-advice.ts";

const targets = {
  targetCalories: 2500,
  targetProteinG: 160,
  targetCarbsG: 280,
  targetFatG: 76,
};

describe("suggestNextMeal", () => {
  it("basit modda (sayısal veri yok) genel tavsiye döner", () => {
    const s = suggestNextMeal({
      consumedSoFar: null, targets, nextMealLabel: "Öğle", remainingMeals: 2,
    });
    assert.equal(s.basis, "general");
    assert.equal(s.gaps, undefined, "basit modda sayısal boşluk üretilmemeli");
    assert.ok(s.message.length > 0);
  });

  it("basit modda öğüne göre farklı genel tavsiye verir", () => {
    const ogle = suggestNextMeal({ consumedSoFar: null, targets, nextMealLabel: "Öğle", remainingMeals: 2 });
    const aksam = suggestNextMeal({ consumedSoFar: null, targets, nextMealLabel: "Akşam", remainingMeals: 1 });
    assert.notEqual(ogle.message, aksam.message);
  });

  it("detaylı modda sayısal boşlukları hesaplar", () => {
    const s = suggestNextMeal({
      consumedSoFar: { calories: 600, proteinG: 30, carbsG: 60, fatG: 20, fiberG: 5 },
      targets, nextMealLabel: "Öğle", remainingMeals: 2,
    });
    assert.equal(s.basis, "numeric");
    assert.deepEqual(s.gaps, { calories: 1900, proteinG: 130, carbsG: 220, fatG: 56 });
    // 130 g kalan protein / 2 öğün = 65 g
    assert.ok(s.message.includes("65"), s.message);
  });

  it("eksik proteini somut bir porsiyonla önerir", () => {
    const s = suggestNextMeal({
      consumedSoFar: { calories: 1800, proteinG: 130, carbsG: 200, fatG: 60, fiberG: 20 },
      targets, nextMealLabel: "Akşam", remainingMeals: 1,
    });
    // 30 g eksik → 100 g tavuk göğsü (31 g) en yakın porsiyon
    assert.ok(s.message.includes("tavuk göğsü"), s.message);
  });

  it("kalori hedefi aşıldıysa ekleme değil dengeleme önerir", () => {
    const s = suggestNextMeal({
      consumedSoFar: { calories: 2600, proteinG: 170, carbsG: 300, fatG: 80, fiberG: 25 },
      targets, nextMealLabel: "Akşam", remainingMeals: 1,
    });
    assert.equal(s.basis, "numeric");
    assert.ok(s.message.includes("karşıladın"), s.message);
    assert.ok(s.gaps!.calories < 0);
  });

  it("protein hedefine yaklaşıldığında lif odaklı tavsiye verir", () => {
    const s = suggestNextMeal({
      consumedSoFar: { calories: 2000, proteinG: 158, carbsG: 240, fatG: 65, fiberG: 18 },
      targets, nextMealLabel: "Akşam", remainingMeals: 1,
    });
    assert.ok(s.message.includes("lif"), s.message);
  });

  it("her durumda diyetisyen uyarısını taşır", () => {
    const cases = [
      suggestNextMeal({ consumedSoFar: null, targets, nextMealLabel: "Öğle", remainingMeals: 2 }),
      suggestNextMeal({ consumedSoFar: { calories: 600, proteinG: 30, carbsG: 60, fatG: 20, fiberG: 5 }, targets, nextMealLabel: "Öğle", remainingMeals: 2 }),
      suggestNextMeal({ consumedSoFar: { calories: 3000, proteinG: 200, carbsG: 350, fatG: 90, fiberG: 30 }, targets, nextMealLabel: "Akşam", remainingMeals: 1 }),
    ];
    for (const c of cases) assert.equal(c.disclaimer, DIETITIAN_DISCLAIMER);
  });

  it("kalan öğün sıfır verilse bile bölme hatası vermez", () => {
    const s = suggestNextMeal({
      consumedSoFar: { calories: 600, proteinG: 30, carbsG: 60, fatG: 20, fiberG: 5 },
      targets, nextMealLabel: "Öğle", remainingMeals: 0,
    });
    assert.ok(Number.isFinite(s.gaps!.proteinG));
  });
});

describe("previousDayReference", () => {
  it("BASİT mod verisinden sayısal çıkarım YAPMAZ", () => {
    const r = previousDayReference({
      previousEntry: { mode: "SIMPLE", proteinG: null },
      perMealProteinTargetG: 40, mealLabel: "Kahvaltı",
    });
    assert.equal(r, null);
  });

  it("basit modda sayı bulunsa bile yok sayar", () => {
    // Savunma: mod SIMPLE ise sayısal alan dolu olsa da kullanılmamalı.
    const r = previousDayReference({
      previousEntry: { mode: "SIMPLE", proteinG: 5 },
      perMealProteinTargetG: 40, mealLabel: "Kahvaltı",
    });
    assert.equal(r, null);
  });

  it("dünkü kayıt yoksa null döner", () => {
    assert.equal(
      previousDayReference({ previousEntry: null, perMealProteinTargetG: 40, mealLabel: "Kahvaltı" }),
      null
    );
  });

  it("detaylı modda belirgin eksik varsa somut telafi önerir", () => {
    const r = previousDayReference({
      previousEntry: { mode: "DETAILED", proteinG: 15 },
      perMealProteinTargetG: 40, mealLabel: "Kahvaltı",
    });
    assert.ok(r, "öneri üretilmeli");
    assert.ok(r!.includes("15"), r!);
    assert.ok(r!.includes("40"), r!);
    // 25 g eksik → 1 kase mercimek (18 g) veya 100 g tavuk (31 g) en yakınlar
    assert.ok(/mercimek|tavuk/.test(r!), r!);
  });

  it("küçük sapmada gereksiz uyarı üretmez", () => {
    // %20 eşiğinin altında kalan fark
    const r = previousDayReference({
      previousEntry: { mode: "DETAILED", proteinG: 35 },
      perMealProteinTargetG: 40, mealLabel: "Kahvaltı",
    });
    assert.equal(r, null);
  });

  it("hedefin üstünde kalındıysa uyarı üretmez", () => {
    const r = previousDayReference({
      previousEntry: { mode: "DETAILED", proteinG: 55 },
      perMealProteinTargetG: 40, mealLabel: "Kahvaltı",
    });
    assert.equal(r, null);
  });
});
