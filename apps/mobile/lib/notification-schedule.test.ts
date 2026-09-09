import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_QUIET_HOURS,
  computeTriggerTimes,
  findMissedTriggers,
  isQuiet,
} from "./notification-schedule.ts";

/** Yerel saatle bir an üretir — isQuiet yerel saati okuyor. */
const at = (h: number, m = 0) => new Date(2026, 8, 15, h, m, 0, 0);

describe("isQuiet", () => {
  const q = DEFAULT_QUIET_HOURS; // 22:00 - 08:00

  it("gece yarısını aşan pencereyi doğru kapsar", () => {
    assert.equal(isQuiet(at(23), q), true);
    assert.equal(isQuiet(at(3), q), true);
    assert.equal(isQuiet(at(7, 59), q), true);
  });

  it("başlangıcı dahil, bitişi hariç tutar", () => {
    assert.equal(isQuiet(at(22), q), true);
    assert.equal(isQuiet(at(8), q), false);
  });

  it("gündüz saatlerini sessiz saymaz", () => {
    assert.equal(isQuiet(at(14), q), false);
  });

  it("gece yarısını aşmayan pencerede çalışır", () => {
    const lunch = { start: "13:00", end: "14:00" };
    assert.equal(isQuiet(at(13, 30), lunch), true);
    assert.equal(isQuiet(at(12, 59), lunch), false);
    assert.equal(isQuiet(at(14), lunch), false);
  });

  it("start === end ise sessiz saat yok sayar", () => {
    assert.equal(isQuiet(at(3), { start: "09:00", end: "09:00" }), false);
  });
});

describe("computeTriggerTimes", () => {
  it("sessiz saat yokken eşit aralıklı zamanlar üretir", () => {
    const times = computeTriggerTimes({
      from: at(9),
      intervalSeconds: 20 * 60,
      count: 5,
      quietHours: null,
    });
    assert.equal(times.length, 5);
    assert.equal(times[0].getTime() - at(9).getTime(), 20 * 60 * 1000);
    assert.equal(times[1].getTime() - times[0].getTime(), 20 * 60 * 1000);
  });

  it("sessiz pencereye düşen zamanları atlar", () => {
    const times = computeTriggerTimes({
      from: at(21, 30),
      intervalSeconds: 20 * 60,
      count: 3,
      quietHours: DEFAULT_QUIET_HOURS,
    });
    assert.equal(times.length, 3);
    assert.ok(times.every((t) => !isQuiet(t, DEFAULT_QUIET_HOURS)));
    // 21:50 pencereye girmiyor, sonrası sabaha sarkıyor.
    assert.equal(times[0].getHours(), 21);
    assert.equal(times[0].getMinutes(), 50);
    assert.ok(times[1].getHours() >= 8);
  });

  it("neredeyse tüm gün sessizken donmaz", () => {
    const started = Date.now();
    const times = computeTriggerTimes({
      from: at(9),
      intervalSeconds: 60,
      count: 10,
      quietHours: { start: "00:01", end: "00:00" },
    });
    assert.ok(Date.now() - started < 2000, "deneme sınırı devreye girmeli");
    assert.ok(times.length < 10, "hiçbir aday geçemediğinde eksik döner");
  });
});

describe("findMissedTriggers", () => {
  const scheduled = [at(9), at(10), at(11), at(12)];

  it("son yanıttan sonraki geçmiş tetiklemeleri döner", () => {
    const missed = findMissedTriggers({
      scheduled,
      now: at(11, 30),
      lastRespondedAt: at(9, 30),
    });
    assert.deepEqual(
      missed.map((d) => d.getHours()),
      [10, 11]
    );
  });

  it("hiç yanıt yoksa geçmişteki hepsini döner", () => {
    const missed = findMissedTriggers({ scheduled, now: at(11, 30), lastRespondedAt: null });
    assert.equal(missed.length, 3);
  });

  it("gelecekteki tetiklemeleri saymaz", () => {
    const missed = findMissedTriggers({ scheduled, now: at(8), lastRespondedAt: null });
    assert.equal(missed.length, 0);
  });

  it("üst sınırı uygular ve en yenileri tutar", () => {
    const many = Array.from({ length: 200 }, (_, i) => at(0, i));
    const missed = findMissedTriggers({ scheduled: many, now: at(9), lastRespondedAt: null, cap: 5 });
    assert.equal(missed.length, 5);
    assert.equal(missed[4].getMinutes(), 199 % 60 === 0 ? 0 : many[199].getMinutes());
  });
});
