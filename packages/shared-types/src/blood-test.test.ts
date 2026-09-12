import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { bloodTestReminderSchema, nextBloodTestDate } from "./blood-test.ts";

const now = new Date("2026-09-12T10:00:00.000Z");

describe("nextBloodTestDate", () => {
  it("son tahlil tarihinin üzerine aralığı ekler", () => {
    const d = nextBloodTestDate({
      lastBloodTestDate: new Date("2026-06-01T00:00:00.000Z"),
      reminderMonths: 6,
      now,
    });
    assert.equal(d.toISOString().slice(0, 10), "2026-12-01");
  });

  it("son tahlil tarihi bilinmiyorsa bugünden sayar", () => {
    const d = nextBloodTestDate({ lastBloodTestDate: null, reminderMonths: 3, now });
    assert.equal(d.toISOString().slice(0, 10), "2026-12-12");
  });

  it("hesaplanan tarih geçmişte kalıyorsa bugüne öteler", () => {
    // 2 yıl önce tahlil + 6 ay = geçmiş. Geçmişe bildirim kurulamaz.
    const d = nextBloodTestDate({
      lastBloodTestDate: new Date("2024-01-01T00:00:00.000Z"),
      reminderMonths: 6,
      now,
    });
    assert.equal(d.getTime(), now.getTime());
  });

  it("ay sonu taşmasında geçerli bir tarih üretir", () => {
    // 31 Ocak + 1 ay → JS Şubat'ta taşar; sonuç yine geçerli bir tarih olmalı.
    const d = nextBloodTestDate({
      lastBloodTestDate: new Date("2026-01-31T00:00:00.000Z"),
      reminderMonths: 1,
      now: new Date("2026-01-01T00:00:00.000Z"),
    });
    assert.ok(!Number.isNaN(d.getTime()));
    assert.ok(d.getTime() > new Date("2026-01-31T00:00:00.000Z").getTime());
  });
});

describe("bloodTestReminderSchema", () => {
  it("hatırlatmayı kapatmak için null kabul eder", () => {
    assert.equal(bloodTestReminderSchema.safeParse({ reminderMonths: null }).success, true);
  });

  it("hazır aralıkları kabul eder", () => {
    for (const m of [3, 6, 12]) {
      assert.equal(bloodTestReminderSchema.safeParse({ reminderMonths: m }).success, true);
    }
  });

  it("özel aralığı kabul eder", () => {
    assert.equal(bloodTestReminderSchema.safeParse({ reminderMonths: 18 }).success, true);
  });

  it("sıfır veya negatif aralığı reddeder", () => {
    assert.equal(bloodTestReminderSchema.safeParse({ reminderMonths: 0 }).success, false);
    assert.equal(bloodTestReminderSchema.safeParse({ reminderMonths: -3 }).success, false);
  });

  it("geçersiz tarih biçimini reddeder", () => {
    const r = bloodTestReminderSchema.safeParse({
      lastBloodTestDate: "12/06/2026", reminderMonths: 6,
    });
    assert.equal(r.success, false);
  });
});
