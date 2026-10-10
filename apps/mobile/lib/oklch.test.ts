import assert from "node:assert/strict";
import { test } from "node:test";

import { oklchToRgb, toChannels, toCss } from "./oklch.ts";

test("siyah ve beyaz uç noktaları", () => {
  assert.deepEqual(oklchToRgb(0, 0, 0), [0, 0, 0]);
  assert.deepEqual(oklchToRgb(1, 0, 0), [255, 255, 255]);
});

test("kromasız L=0.6 gri sRGB'de 128 (0.6³ = 0.216 doğrusal)", () => {
  const [r, g, b] = oklchToRgb(0.6, 0, 0);
  assert.ok(Math.abs(r - 128) <= 1, `r=${r}`);
  assert.equal(r, g);
  assert.equal(g, b);
});

test("saf kırmızı (oklch 0.628 0.258 29.23) ≈ #ff0000", () => {
  const [r, g, b] = oklchToRgb(0.628, 0.2577, 29.23);
  assert.ok(r >= 253, `r=${r}`);
  assert.ok(g <= 3 && b <= 3, `g=${g} b=${b}`);
});

test("gamut dışı kroma kırpılmaz, düşürülür: sonuç hep 0–255 içinde", () => {
  for (let h = 0; h < 360; h += 15) {
    for (const l of [0.2, 0.5, 0.8]) {
      const rgb = oklchToRgb(l, 0.4, h);
      for (const v of rgb) assert.ok(v >= 0 && v <= 255 && Number.isInteger(v));
    }
  }
});

test("açıklık sırası korunur: t25 > t500 > t900 (mor hue)", () => {
  const sum = (l: number, c: number) => oklchToRgb(l, c, 290).reduce((a, b) => a + b, 0);
  assert.ok(sum(0.975, 0.012) > sum(0.58, 0.18));
  assert.ok(sum(0.58, 0.18) > sum(0.19, 0.04));
});

test("biçimleyiciler", () => {
  assert.equal(toChannels([1, 2, 3]), "1 2 3");
  assert.equal(toCss([1, 2, 3]), "rgb(1, 2, 3)");
});
