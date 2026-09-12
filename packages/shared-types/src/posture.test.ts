import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  allowedSettings,
  budgetSeconds,
  buildExerciseSet,
  workHoursToQuietHours,
} from "./posture-exercises.ts";
import { eligibleFyi, rotateFyi } from "./posture-fyi.ts";
import { postureProfileSchema } from "./posture.ts";

describe("allowedSettings", () => {
  it("masa başı için yalnızca sessiz hareketler", () => {
    assert.deepEqual(allowedSettings("SEDENTARY"), ["quiet"]);
  });
  it("ayakta çalışan için hareketli set", () => {
    assert.deepEqual(allowedSettings("STANDING_ACTIVE"), ["active"]);
  });
  it("karma çalışan ikisini de alır", () => {
    assert.deepEqual(allowedSettings("MIXED"), ["quiet", "active"]);
  });
});

describe("budgetSeconds", () => {
  it("docs/05'teki üç kademeyi karşılar", () => {
    assert.equal(budgetSeconds(1), 120);
    assert.equal(budgetSeconds(2), 120);
    assert.equal(budgetSeconds(3), 300);
    assert.equal(budgetSeconds(5), 300);
    assert.equal(budgetSeconds(8), 480);
  });
});

describe("buildExerciseSet", () => {
  it("masa başı kullanıcıya ayakta hareket ÖNERMEZ", () => {
    const set = buildExerciseSet({ workStyle: "SEDENTARY", minutesPerHourAvailable: 8, rotation: 0 });
    assert.ok(set.exercises.length > 0);
    assert.ok(set.exercises.every((e) => e.setting === "quiet"),
      set.exercises.map((e) => e.setting).join(","));
  });

  it("ayakta çalışana sessiz masa hareketleri önermez", () => {
    const set = buildExerciseSet({ workStyle: "STANDING_ACTIVE", minutesPerHourAvailable: 8, rotation: 0 });
    assert.ok(set.exercises.every((e) => e.setting === "active"));
  });

  it("süre bütçesini aşmaz", () => {
    for (const dk of [1, 2, 3, 5, 8, 15]) {
      const set = buildExerciseSet({ workStyle: "MIXED", minutesPerHourAvailable: dk, rotation: 0 });
      assert.ok(set.totalSeconds <= budgetSeconds(dk),
        `${dk} dk: ${set.totalSeconds}s > ${budgetSeconds(dk)}s`);
    }
  });

  it("kısa sürede daha az, uzun sürede daha çok hareket verir", () => {
    const kisa = buildExerciseSet({ workStyle: "MIXED", minutesPerHourAvailable: 2, rotation: 0 });
    const uzun = buildExerciseSet({ workStyle: "MIXED", minutesPerHourAvailable: 8, rotation: 0 });
    assert.ok(uzun.exercises.length > kisa.exercises.length,
      `kısa ${kisa.exercises.length}, uzun ${uzun.exercises.length}`);
  });

  it("rotasyon değişince farklı set üretir", () => {
    const a = buildExerciseSet({ workStyle: "SEDENTARY", minutesPerHourAvailable: 2, rotation: 0 });
    const b = buildExerciseSet({ workStyle: "SEDENTARY", minutesPerHourAvailable: 2, rotation: 1 });
    assert.notDeepEqual(a.exercises.map((e) => e.id), b.exercises.map((e) => e.id));
  });

  it("aynı girdi aynı seti üretir (deterministik)", () => {
    const a = buildExerciseSet({ workStyle: "MIXED", minutesPerHourAvailable: 5, rotation: 3 });
    const b = buildExerciseSet({ workStyle: "MIXED", minutesPerHourAvailable: 5, rotation: 3 });
    assert.deepEqual(a, b);
  });

  it("bütçe çok küçükse bile en az bir hareket döner", () => {
    // budgetSeconds(1) = 120 ve en kısa hareket 20 sn, ama yine de savunma.
    const set = buildExerciseSet({ workStyle: "SEDENTARY", minutesPerHourAvailable: 1, rotation: 0 });
    assert.ok(set.exercises.length >= 1);
  });
});

describe("workHoursToQuietHours", () => {
  it("mesai penceresini tersine çevirir", () => {
    assert.deepEqual(workHoursToQuietHours("09:00", "18:00"), { start: "18:00", end: "09:00" });
  });

  it("mesai tanımlı değilse sessiz saat yok", () => {
    assert.equal(workHoursToQuietHours(null, "18:00"), null);
    assert.equal(workHoursToQuietHours("09:00", null), null);
    assert.equal(workHoursToQuietHours(undefined, undefined), null);
  });

  it("gece vardiyasında da pencereyi çevirir", () => {
    // Mesai 22:00-06:00 → sessiz 06:00-22:00
    assert.deepEqual(workHoursToQuietHours("22:00", "06:00"), { start: "06:00", end: "22:00" });
  });
});

describe("FYI rotasyonu", () => {
  const masaBasi = { workStyle: "SEDENTARY" as const, workIntensity: "LIGHT" as const, hasScreenWork: true };

  it("çalışma şekline uymayan notu elemez içeri almaz", () => {
    const pool = eligibleFyi(masaBasi);
    assert.ok(pool.every((m) => !m.workStyles || m.workStyles.includes("SEDENTARY")));
    assert.ok(!pool.some((m) => m.id === "weight-shift"), "ayakta notu masa başına gelmemeli");
  });

  it("ekran işi yoksa ekran notlarını göstermez", () => {
    const pool = eligibleFyi({ ...masaBasi, hasScreenWork: false });
    assert.ok(!pool.some((m) => m.requiresScreenWork));
  });

  it("ağır iş yoğunluğunda kaldırma notu gelir", () => {
    const pool = eligibleFyi({ workStyle: "MIXED", workIntensity: "HEAVY", hasScreenWork: false });
    assert.ok(pool.some((m) => m.id === "lift-with-knees"));
  });

  it("hafif işte kaldırma notu gelmez", () => {
    const pool = eligibleFyi({ workStyle: "MIXED", workIntensity: "LIGHT", hasScreenWork: false });
    assert.ok(!pool.some((m) => m.id === "lift-with-knees"));
  });

  it("rotasyon arka arkaya farklı not verir ve başa döner", () => {
    const pool = eligibleFyi(masaBasi);
    const ilk = rotateFyi(masaBasi, 0);
    const ikinci = rotateFyi(masaBasi, 1);
    assert.notEqual(ilk?.id, ikinci?.id);
    assert.equal(rotateFyi(masaBasi, pool.length)?.id, ilk?.id, "tur başa dönmeli");
  });

  it("negatif rotasyonda çökmez", () => {
    assert.ok(rotateFyi(masaBasi, -3));
  });
});

describe("postureProfileSchema", () => {
  const gecerli = {
    workStyle: "SEDENTARY", workIntensity: "LIGHT", occupationType: "Yazılım/Ofis",
    minutesPerHourAvailable: 5, workHoursStart: "09:00", workHoursEnd: "18:00",
  };

  it("geçerli profili kabul eder", () => {
    assert.equal(postureProfileSchema.safeParse(gecerli).success, true);
  });

  it("geçersiz mesai saatini reddeder", () => {
    assert.equal(postureProfileSchema.safeParse({ ...gecerli, workHoursStart: "9am" }).success, false);
  });

  it("sınır dışı dakikayı reddeder", () => {
    assert.equal(postureProfileSchema.safeParse({ ...gecerli, minutesPerHourAvailable: 0 }).success, false);
    assert.equal(postureProfileSchema.safeParse({ ...gecerli, minutesPerHourAvailable: 99 }).success, false);
  });

  it("ekran saati opsiyonel", () => {
    assert.equal(postureProfileSchema.safeParse({ ...gecerli, screenHoursPerDay: null }).success, true);
  });
});
