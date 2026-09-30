import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  FOOD_TABLE_DISCLAIMER,
  availableUnits,
  getFoodTable,
  gramsFor,
  normalizeFoodQuery,
  scaleNutrients,
  searchFoods,
  type FoodEntry,
} from "./food-table.ts";

const table = getFoodTable();
const byId = new Map(table.map((f) => [f.id, f]));

function need(id: string): FoodEntry {
  const entry = byId.get(id);
  assert.ok(entry, `${id} tabloda yok`);
  return entry;
}

describe("tablo bütünlüğü", () => {
  it("beklenen büyüklükte ve iki kaynaktan da kayıt içeriyor", () => {
    assert.ok(table.length > 1000, `sadece ${table.length} kayıt`);
    assert.ok(table.some((f) => f.source === "turkomp"));
    assert.ok(table.some((f) => f.source === "curated"));
  });

  it("kimlikler tekil", () => {
    assert.equal(byId.size, table.length);
  });

  it("her kaydın adı ve makroları geçerli aralıkta", () => {
    for (const f of table) {
      assert.ok(f.name.length > 0, `${f.id}: ad boş`);
      const { calories, protein, carbs, fat, fiber } = f.per100g;
      // 100 g'da en fazla ~900 kcal olur (saf yağ 884).
      assert.ok(calories >= 0 && calories <= 900, `${f.id}: kcal ${calories}`);
      for (const [key, v] of [
        ["protein", protein],
        ["carbs", carbs],
        ["fat", fat],
      ] as const) {
        assert.ok(v >= 0 && v <= 100, `${f.id}: ${key} ${v}`);
      }
      if (fiber !== null) assert.ok(fiber >= 0 && fiber <= 100, `${f.id}: lif ${fiber}`);
    }
  });

  it("türetilmiş birim çevrimleri makul", () => {
    for (const f of table) {
      if (f.gramsPerPiece !== null) {
        assert.ok(f.gramsPerPiece > 0 && f.gramsPerPiece <= 1000, `${f.id}: ${f.gramsPerPiece} g/adet`);
      }
      if (f.gramsPerMl !== null) {
        assert.ok(f.gramsPerMl >= 0.5 && f.gramsPerMl <= 2, `${f.id}: ${f.gramsPerMl} g/ml`);
      }
    }
  });

  it("bilinen değerleri kaynakla aynı taşıyor", () => {
    // TürKomp: yumurta, tavuk, tam — 100 g'da 140 kcal / 13.13 g protein.
    const yumurta = need("turkomp_26");
    assert.equal(yumurta.per100g.calories, 140);
    assert.equal(yumurta.per100g.protein, 13.13);
  });

  it("TürKomp kayıtlarına adet ağırlığı atamaz", () => {
    // Kaynak derlemede porsiyon ölçüleri gıda grubu başına atanmış (zeytinyağı
    // zeytinin "5 tane" ölçüsünü almış), bu yüzden adet ağırlığı yalnızca
    // besin başına doğrulanmış kayıtlardan geliyor.
    for (const f of table) {
      if (f.source === "turkomp") assert.equal(f.gramsPerPiece, null, `${f.id} ${f.name}`);
    }
    assert.ok(table.some((f) => f.source === "curated" && f.gramsPerPiece !== null));
  });
});

describe("normalizeFoodQuery", () => {
  it("Türkçe harfleri ASCII'ye indirir", () => {
    assert.equal(normalizeFoodQuery("Yoğurt"), "yogurt");
    assert.equal(normalizeFoodQuery("ÇİĞ KÖFTE"), "cig kofte");
    assert.equal(normalizeFoodQuery("Iğdır"), "igdir");
  });

  it("noktalama ve fazla boşluğu temizler", () => {
    assert.equal(normalizeFoodQuery("  Zeytin,  siyah  "), "zeytin siyah");
  });
});

describe("searchFoods", () => {
  it("tek harflik sorguda arama yapmaz", () => {
    assert.deepEqual(searchFoods("y"), []);
  });

  it("Türkçe karakter yazılmadan da bulur", () => {
    const withDiacritics = searchFoods("yoğurt").map((f) => f.id);
    const without = searchFoods("yogurt").map((f) => f.id);
    assert.deepEqual(without, withDiacritics);
    assert.ok(withDiacritics.length > 0);
  });

  it("tam eşleşmeyi en öne alır", () => {
    assert.equal(searchFoods("muz")[0].name, "Muz");
    assert.equal(searchFoods("elma")[0].name, "Elma");
  });

  it("kelime sınırına saygı duyar: 'zeytin' zeytinyağını öne almaz", () => {
    const results = searchFoods("zeytin", 6).map((f) => f.name);
    const zeytin = results.findIndex((n) => n.startsWith("Zeytin,"));
    const yag = results.findIndex((n) => n.startsWith("Zeytinyağı"));
    assert.ok(zeytin !== -1, `zeytin sonuçta yok: ${results.join(" / ")}`);
    assert.ok(zeytin < yag || yag === -1, `zeytinyağı önce geldi: ${results.join(" / ")}`);
  });

  it("adın başındaki kelimeyi ortasındakine tercih eder", () => {
    const results = searchFoods("tavuk", 12);
    const firstHead = results.findIndex((f) => normalizeFoodQuery(f.name).startsWith("tavuk"));
    assert.equal(firstHead, 0, `ilk sonuç 'tavuk' ile başlamıyor: ${results[0]?.name}`);
  });

  it("çok kelimeli sorguda kelime başlarını eşler", () => {
    const results = searchFoods("beyaz peynir");
    assert.ok(results.length > 0);
    for (const f of results.slice(0, 3)) {
      const n = normalizeFoodQuery(f.name);
      assert.ok(n.includes("beyaz") && n.includes("peynir"), `alakasız sonuç: ${f.name}`);
    }
  });

  it("limit'e uyar", () => {
    assert.equal(searchFoods("e", 5).length, 0);
    assert.ok(searchFoods("peynir", 3).length <= 3);
  });

  it("eşleşme yoksa boş döner", () => {
    assert.deepEqual(searchFoods("zzzzqqqq"), []);
  });
});

describe("gramsFor", () => {
  const yumurta = need("curated_yumurta_haslanmis"); // 55 g/adet
  const sut = need("turkomp_17"); // 1.03 g/ml

  it("gram birimini olduğu gibi döner", () => {
    assert.equal(gramsFor(yumurta, 150, "g"), 150);
  });

  it("adedi gramaja çevirir", () => {
    assert.equal(yumurta.gramsPerPiece, 55);
    assert.equal(gramsFor(yumurta, 2, "adet"), 110);
  });

  it("ml'yi yoğunlukla çevirir", () => {
    assert.equal(gramsFor(sut, 200, "ml"), 206);
  });

  it("veri yoksa uydurmaz", () => {
    assert.equal(gramsFor(yumurta, 200, "ml"), null);
    assert.equal(gramsFor(sut, 1, "adet"), null);
  });

  it("geçersiz miktarı reddeder", () => {
    assert.equal(gramsFor(yumurta, 0, "g"), null);
    assert.equal(gramsFor(yumurta, -5, "g"), null);
    assert.equal(gramsFor(yumurta, Number.NaN, "g"), null);
  });
});

describe("availableUnits", () => {
  it("gramı her zaman sunar", () => {
    for (const f of table) assert.ok(availableUnits(f).includes("g"), f.id);
  });

  it("yalnızca çevrilebilen birimleri sunar", () => {
    for (const f of table) {
      const units = availableUnits(f);
      assert.equal(units.includes("adet"), f.gramsPerPiece !== null, `${f.id} adet`);
      assert.equal(units.includes("ml"), f.gramsPerMl !== null, `${f.id} ml`);
    }
  });

  it("sunduğu her birim gerçekten hesaplanabiliyor", () => {
    for (const f of table) {
      for (const unit of availableUnits(f)) {
        assert.ok(scaleNutrients(f, 1, unit) !== null, `${f.id} ${unit} hesaplanamadı`);
      }
    }
  });

  it("katı bir besinde ml sunmaz, sıvıda adet sunmaz", () => {
    assert.deepEqual(availableUnits(need("turkomp_26")), ["g"]); // yumurta (TürKomp)
    assert.deepEqual(availableUnits(need("curated_yumurta_haslanmis")), ["g", "adet"]);
    assert.deepEqual(availableUnits(need("turkomp_17")), ["g", "ml"]); // süt
  });
});

describe("scaleNutrients", () => {
  it("100 g'da tablodaki değerleri verir", () => {
    const f = need("turkomp_26");
    const r = scaleNutrients(f, 100, "g");
    assert.ok(r);
    assert.equal(r.calories, 140);
    // Makrolar 0.1 g hassasiyetine yuvarlanıyor (13.13 → 13.1).
    assert.equal(r.protein, 13.1);
  });

  it("miktarla doğrusal ölçekler", () => {
    const f = need("turkomp_26"); // 140 kcal, 13.13 g protein / 100 g
    const r = scaleNutrients(f, 150, "g");
    assert.ok(r);
    assert.equal(r.calories, 210);
    assert.equal(r.protein, 19.7); // 13.13 × 1.5 = 19.695
  });

  it("adet biriminde gramaj üzerinden hesaplar", () => {
    const f = need("curated_yumurta_haslanmis");
    assert.deepEqual(scaleNutrients(f, 2, "adet"), scaleNutrients(f, 110, "g"));
  });

  it("lif ölçülmemişse null bırakır, sıfır uydurmaz", () => {
    const f = need("turkomp_26"); // TürKomp'ta yumurtanın lifi ölçülmemiş
    assert.equal(f.per100g.fiber, null);
    assert.equal(scaleNutrients(f, 100, "g")?.fiber, null);
  });

  it("çevrilemeyen birimde null döner", () => {
    assert.equal(scaleNutrients(need("turkomp_26"), 100, "adet"), null);
    assert.equal(scaleNutrients(need("turkomp_26"), 100, "ml"), null);
  });
});

describe("yasal uyarı", () => {
  it("diyetisyen ibaresini içeriyor", () => {
    assert.match(FOOD_TABLE_DISCLAIMER, /diyetisyen/i);
  });
});
