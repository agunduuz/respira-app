import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { BREATHING_TECHNIQUES, recommendTechnique } from "./stress.ts";

describe("recommendTechnique", () => {
  it("düşük seviyede diyaframatik önerir", () => {
    assert.equal(recommendTechnique(1), "DIAPHRAGMATIC");
    assert.equal(recommendTechnique(2), "DIAPHRAGMATIC");
  });
  it("orta seviyede kutu nefesi önerir", () => {
    assert.equal(recommendTechnique(3), "BOX");
  });
  it("yüksek seviyede 4-7-8 önerir", () => {
    assert.equal(recommendTechnique(4), "FOUR_SEVEN_EIGHT");
    assert.equal(recommendTechnique(5), "FOUR_SEVEN_EIGHT");
  });
});

describe("BREATHING_TECHNIQUES", () => {
  it("kutu nefesinin döngüsü docs/07 ile eşleşir (4+4+4+4=16sn)", () => {
    assert.equal(BREATHING_TECHNIQUES.BOX.cycleSeconds, 16);
  });
  it("4-7-8 döngüsü docs/07 ile eşleşir (4+7+8=19sn)", () => {
    assert.equal(BREATHING_TECHNIQUES.FOUR_SEVEN_EIGHT.cycleSeconds, 19);
  });
  it("her teknik için seans süresi ~5dk'yı aşmaz ve tam döngü sayısıdır", () => {
    for (const def of Object.values(BREATHING_TECHNIQUES)) {
      assert.ok(def.sessionDurationSeconds <= 300);
      assert.equal(def.sessionDurationSeconds % def.cycleSeconds, 0);
      assert.ok(def.sessionDurationSeconds >= def.cycleSeconds);
    }
  });
});
