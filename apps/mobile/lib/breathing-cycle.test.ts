import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { breathingStateAt, cycleSeconds } from "./breathing-cycle.ts";

const BOX = [
  { type: "inhale" as const, seconds: 4 },
  { type: "hold" as const, seconds: 4 },
  { type: "exhale" as const, seconds: 4 },
  { type: "hold" as const, seconds: 4 },
];

describe("cycleSeconds", () => {
  it("fazların toplamını verir", () => {
    assert.equal(cycleSeconds(BOX), 16);
  });
});

describe("breathingStateAt", () => {
  it("t=0'da ilk fazın başındadır", () => {
    const s = breathingStateAt(BOX, 0);
    assert.equal(s.phaseIndex, 0);
    assert.equal(s.phase.type, "inhale");
    assert.equal(s.remainingInPhase, 4);
  });

  it("faz sınırında bir sonraki faza geçer", () => {
    const s = breathingStateAt(BOX, 4);
    assert.equal(s.phaseIndex, 1);
    assert.equal(s.phase.type, "hold");
  });

  it("faz ortasında doğru ilerleme oranını verir", () => {
    const s = breathingStateAt(BOX, 2);
    assert.equal(s.phaseIndex, 0);
    assert.equal(s.phaseProgress, 0.5);
    assert.equal(s.remainingInPhase, 2);
  });

  it("döngü bitince başa sarar", () => {
    const s = breathingStateAt(BOX, 16 + 2);
    assert.equal(s.phaseIndex, 0);
    assert.equal(s.phaseProgress, 0.5);
  });

  it("negatif değerde bile çökmez", () => {
    const s = breathingStateAt(BOX, -2);
    assert.equal(s.phaseIndex, 3); // son faz (hold), 16-2=14 -> 12'den sonraki hold
  });
});
