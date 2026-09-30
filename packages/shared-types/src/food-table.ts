/**
 * Besin değeri tablosu — docs/04, detaylı modda makroların otomatik doldurulması.
 *
 * Neden hazır bir API değil? Foto/serbest metin üzerinden "ne yedin?" tahmini
 * yapan ticari servisler gerçek dünyada besini %68-86 doğru tanıyor. Bizim
 * detaylı modumuz zaten besini ve miktarı kullanıcıya ELLE tanımlattırıyor,
 * yani tahminin en zayıf halkası baştan yok. Geriye kalan iş "100 g başına
 * değeri bul, miktarla çarp" — saf arama + aritmetik. Doğruluk tamamen
 * tablonun doğruluğuna bağlı olduğu için laboratuvar analizli resmi veri
 * kullanıyoruz ve dışarıya hiç çağrı yapmıyoruz (çevrimdışı da çalışır).
 *
 * ⚠️ Değerler ortalamalardır; aynı yemeğin her tarifi farklıdır. Tıbbi tavsiye
 * değildir.
 */

import { FOOD_ROWS } from "./food-table-data.ts";

export type FoodSource = "turkomp" | "curated";

export interface FoodNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  /** Kaynakta lif ölçülmemiş olabilir. */
  fiber: number | null;
}

export interface FoodEntry {
  id: string;
  name: string;
  source: FoodSource;
  per100g: FoodNutrients;
  /**
   * 1 adedin kaç gram olduğu. Kaynağın porsiyon ölçülerinden türetilmiş bir
   * YAKLAŞIKTIR (ör. "1 dilim (30 g)") ve 100 g değerleri kadar güvenilir
   * değil — bu yüzden arayüz varsayılan gramajı kullanıcıya göstermek zorunda.
   */
  gramsPerPiece: number | null;
  /** 1 ml'nin kaç gram olduğu. Yalnızca sıvılarda tanımlı. */
  gramsPerMl: number | null;
}

export type FoodUnit = "g" | "adet" | "ml";

interface IndexedFood {
  entry: FoodEntry;
  /** Aranabilir hâle getirilmiş ad — her tuş vuruşunda yeniden üretilmesin. */
  normalized: string;
  tokens: string[];
}

/** Türkçe harfleri ASCII'ye indirger: "Yoğurt" yazan da "yogurt" yazan da bulsun. */
const TR_MAP: Record<string, string> = {
  ı: "i",
  İ: "i",
  I: "i",
  ş: "s",
  Ş: "s",
  ğ: "g",
  Ğ: "g",
  ü: "u",
  Ü: "u",
  ö: "o",
  Ö: "o",
  ç: "c",
  Ç: "c",
  â: "a",
  Â: "a",
  î: "i",
  Î: "i",
  û: "u",
  Û: "u",
};

export function normalizeFoodQuery(input: string): string {
  let out = "";
  for (const ch of input) out += TR_MAP[ch] ?? ch;
  return out
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseNumber(raw: string): number | null {
  if (raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function parseRows(): IndexedFood[] {
  const out: IndexedFood[] = [];

  for (const line of FOOD_ROWS.split("\n")) {
    if (line === "") continue;
    const [id, name, kcal, protein, carbs, fat, fiber, perPiece, perMl] = line.split("|");

    const calories = parseNumber(kcal);
    if (calories === null) continue;

    const entry: FoodEntry = {
      id,
      name,
      source: id.startsWith("turkomp_") ? "turkomp" : "curated",
      per100g: {
        calories,
        protein: parseNumber(protein) ?? 0,
        carbs: parseNumber(carbs) ?? 0,
        fat: parseNumber(fat) ?? 0,
        fiber: parseNumber(fiber),
      },
      gramsPerPiece: parseNumber(perPiece),
      gramsPerMl: parseNumber(perMl),
    };

    const normalized = normalizeFoodQuery(name);
    out.push({ entry, normalized, tokens: normalized.split(" ") });
  }

  return out;
}

let index: IndexedFood[] | null = null;

function getIndex(): IndexedFood[] {
  index ??= parseRows();
  return index;
}

/** Tablonun tamamı. Tembel ayrıştırılır — paketi import eden her ekran ödemesin. */
export function getFoodTable(): readonly FoodEntry[] {
  return getIndex().map((f) => f.entry);
}

/**
 * Bir kaydın sorguya ne kadar uyduğu; 0 = uymuyor.
 *
 * Kademeler, kullanıcının yazdığı şeyin adın NERESİNDE geçtiğine göre: baştan
 * tam eşleşme en iyi, sonra adın başlangıcı, sonra kelime başları, en sonda
 * kelime ortası. "tavuk" yazınca "Tavuk, göğüs" yemeğin "Tavuklu Kinoa
 * Kâsesi"nden önce gelsin diye bu sıra gerekli.
 */
function scoreFood(food: IndexedFood, query: string, queryTokens: string[]): number {
  if (food.normalized === query) return 6;
  // Kelime sınırı şart: "zeytin" araması "Zeytinyağı"nı değil "Zeytin, siyah"ı
  // öne almalı.
  if (food.normalized.startsWith(`${query} `)) return 5;

  const startsToken = (t: string) => food.tokens.some((nt) => nt.startsWith(t));
  if (queryTokens.every(startsToken)) {
    return food.tokens[0].startsWith(queryTokens[0]) ? 4 : 3;
  }

  if (queryTokens.every((t) => food.normalized.includes(t))) return 1;
  return 0;
}

/**
 * Ada göre besin arar. Sonuçlar puana, eşit puanda daha kısa ada göre sıralı —
 * kısa ad genelde daha jenerik olanı ("Muz" > "Muzlu Yulaf Kâsesi").
 */
export function searchFoods(query: string, limit = 8): FoodEntry[] {
  const q = normalizeFoodQuery(query);
  if (q.length < 2) return [];

  const tokens = q.split(" ");
  const scored: { food: IndexedFood; score: number }[] = [];

  for (const food of getIndex()) {
    const score = scoreFood(food, q, tokens);
    if (score > 0) scored.push({ food, score });
  }

  scored.sort(
    (a, b) =>
      b.score - a.score ||
      a.food.entry.name.length - b.food.entry.name.length ||
      a.food.normalized.localeCompare(b.food.normalized)
  );

  return scored.slice(0, limit).map((s) => s.food.entry);
}

/**
 * Bu besin için anlamlı olan birimler. Arayüz yalnızca bunları gösteriyor:
 * çevrilemeyen bir birimi seçtirip sonra "hesaplayamadım" demek yerine
 * seçeneği hiç sunmuyoruz. Gram her zaman geçerli.
 */
export function availableUnits(entry: FoodEntry): FoodUnit[] {
  const units: FoodUnit[] = ["g"];
  if (entry.gramsPerPiece !== null) units.push("adet");
  if (entry.gramsPerMl !== null) units.push("ml");
  return units;
}

/**
 * Girilen miktarın kaç grama denk geldiği. Birim çevrimi için gereken veri
 * yoksa (ör. katı bir besin için "ml") null döner — uydurmak yerine arayüz
 * kullanıcıdan gram istiyor.
 */
export function gramsFor(entry: FoodEntry, amount: number, unit: FoodUnit): number | null {
  if (!Number.isFinite(amount) || amount <= 0) return null;

  if (unit === "g") return amount;
  if (unit === "adet") return entry.gramsPerPiece === null ? null : amount * entry.gramsPerPiece;
  return entry.gramsPerMl === null ? null : amount * entry.gramsPerMl;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Miktara göre ölçeklenmiş besin değerleri; hesaplanamıyorsa null. */
export function scaleNutrients(
  entry: FoodEntry,
  amount: number,
  unit: FoodUnit
): FoodNutrients | null {
  const grams = gramsFor(entry, amount, unit);
  if (grams === null) return null;

  const factor = grams / 100;
  const { per100g } = entry;

  return {
    calories: Math.round(per100g.calories * factor),
    protein: round1(per100g.protein * factor),
    carbs: round1(per100g.carbs * factor),
    fat: round1(per100g.fat * factor),
    fiber: per100g.fiber === null ? null : round1(per100g.fiber * factor),
  };
}

/** docs/02 — kaynak atıfları uygulamanın Ayarlar > Hakkında bölümünde gösterilir. */
export const FOOD_TABLE_SOURCES = [
  "TürKomp — Ulusal Gıda Kompozisyon Veritabanı (TAGEM/TÜBİTAK), laboratuvar analizli değerler.",
  "Türkiye Beslenme Rehberi (TÜBER) 2022, T.C. Sağlık Bakanlığı — porsiyon ölçülerinin doğrulanmasında referans.",
] as const;

export const FOOD_TABLE_DISCLAIMER =
  "Değerler resmi gıda kompozisyon verisine dayalı ortalamalardır; aynı yemeğin her tarifi farklı olabilir. Kesin takip için bir diyetisyene danışmanı öneririz.";
