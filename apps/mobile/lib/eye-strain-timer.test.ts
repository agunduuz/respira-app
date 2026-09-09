import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatRemaining, viewTimer, type TimerState } from "./eye-strain-timer.ts";

const durations = { intervalMinutes: 20, breakSeconds: 20 };
const T0 = 1_000_000_000_000;

describe("viewTimer", () => {
  it("idle fazda sıfır döner", () => {
    const v = viewTimer({ phase: "idle", startedAt: null }, durations, T0);
    assert.equal(v.remainingSeconds, 0);
    assert.equal(v.progress, 0);
    assert.equal(v.elapsed, false);
  });

  it("çalışma fazında kalan süreyi duvar saatinden hesaplar", () => {
    const state: TimerState = { phase: "working", startedAt: T0 };
    const v = viewTimer(state, durations, T0 + 5 * 60_000);
    assert.equal(v.remainingSeconds, 15 * 60);
    assert.equal(v.progress, 0.25);
    assert.equal(v.elapsed, false);
  });

  it("uygulama arka planda kalsa da süre işlemeye devam eder", () => {
    // 25 dakika sonra geri dönüldü: 20 dakikalık faz çoktan dolmuş olmalı.
    const state: TimerState = { phase: "working", startedAt: T0 };
    const v = viewTimer(state, durations, T0 + 25 * 60_000);
    assert.equal(v.elapsed, true);
    assert.equal(v.remainingSeconds, 0);
    assert.equal(v.progress, 1);
  });

  it("mola fazında breakSeconds kullanır", () => {
    const state: TimerState = { phase: "breaking", startedAt: T0 };
    const v = viewTimer(state, durations, T0 + 5000);
    assert.equal(v.remainingSeconds, 15);
    assert.equal(v.progress, 0.25);
  });

  it("özelleştirilmiş süreleri kullanır", () => {
    const custom = { intervalMinutes: 15, breakSeconds: 30 };
    const v = viewTimer({ phase: "working", startedAt: T0 }, custom, T0 + 60_000);
    assert.equal(v.remainingSeconds, 14 * 60);
  });
});

describe("formatRemaining", () => {
  it("mm:ss biçiminde yazar", () => {
    assert.equal(formatRemaining(20 * 60), "20:00");
    assert.equal(formatRemaining(65), "01:05");
    assert.equal(formatRemaining(5), "00:05");
  });

  it("negatif değerde sıfıra kırpar", () => {
    assert.equal(formatRemaining(-10), "00:00");
  });
});
