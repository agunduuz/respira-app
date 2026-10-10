import assert from "node:assert/strict";
import { test } from "node:test";

import { DEFAULT_HUE, HUE_PRESETS, TONES, hueName, themeVars, toneChannels } from "../theme/tones.ts";

test("varsayılan mor (290°) için t500 tasarımdaki oklch(.58 .18 290) ile aynı", () => {
  assert.equal(DEFAULT_HUE, 290);
  assert.equal(toneChannels(290).t500, "124 96 219");
  assert.equal(toneChannels(290).t900, "20 16 36");
});

test("her hue 15 tonu da üretir ve kanallar 0–255 içinde", () => {
  for (const { hue } of HUE_PRESETS) {
    const t = toneChannels(hue);
    assert.equal(Object.keys(t).length, TONES.length);
    for (const v of Object.values(t)) {
      const ch = v.split(" ").map(Number);
      assert.equal(ch.length, 3);
      assert.ok(ch.every((c) => Number.isInteger(c) && c >= 0 && c <= 255), v);
    }
  }
});

test("hue değişince tonlar değişir ama tehlike rengi sabit kalır", () => {
  const a = themeVars(290);
  const b = themeVars(30);
  assert.notEqual(a["--t300"], b["--t300"]);
  assert.equal(a["--danger"], b["--danger"]);
  assert.equal(a["--surface"], "255 255 255");
});

test("eski semantik token'lar tonlara eşlenir", () => {
  const v = themeVars(200);
  assert.equal(v["--bg"], v["--t25"]);
  assert.equal(v["--text"], v["--t900"]);
  assert.equal(v["--text-muted"], v["--mut"]);
});

test("hueName: hazır renklere ±4° yakınsa adı, değilse Özel", () => {
  assert.equal(hueName(290), "Mor");
  assert.equal(hueName(292), "Mor");
  assert.equal(hueName(205), "Özel · 205°");
});
