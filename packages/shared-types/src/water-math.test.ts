import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  computeExpectedIntakeMl,
  computeHourlyTargetMl,
  computeWaterGoalMl,
} from "./water-math.ts";

describe("computeWaterGoalMl", () => {
  it("docs/06 → kilo × 33", () => {
    assert.equal(computeWaterGoalMl(70), 2310);
  });
  it("küsuratlı sonucu yuvarlar", () => {
    assert.equal(computeWaterGoalMl(65.5), 2162);
  });
});

describe("computeHourlyTargetMl", () => {
  it("docs/06 örneği: 2500ml / 15 saat ≈ 167ml", () => {
    const hourly = computeHourlyTargetMl({
      dailyTargetMl: 2500,
      wakeTime: "08:00",
      sleepTime: "23:00",
    });
    assert.equal(hourly, 167);
  });
});

describe("computeExpectedIntakeMl", () => {
  const base = { dailyTargetMl: 2400, wakeTime: "08:00", sleepTime: "23:00" };

  it("uyanmadan önce 0", () => {
    const now = new Date();
    now.setHours(6, 0, 0, 0);
    assert.equal(computeExpectedIntakeMl({ ...base, now }), 0);
  });

  it("uyku saatinden sonra tam hedef", () => {
    const now = new Date();
    now.setHours(23, 30, 0, 0);
    assert.equal(computeExpectedIntakeMl({ ...base, now }), 2400);
  });

  it("gün ortasında orantılı", () => {
    // 08:00-23:00 = 900 dk uyanıklık; 15:00 = uyanmadan 420 dk sonra → yarı yarıya.
    const now = new Date();
    now.setHours(15, 30, 0, 0);
    const expected = computeExpectedIntakeMl({ ...base, now });
    assert.equal(expected, Math.round(2400 * (450 / 900)));
  });
});
