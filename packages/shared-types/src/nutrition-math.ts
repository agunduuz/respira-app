/**
 * Makro hedefi hesaplaması — docs/04-OZELLIK-KAN-SEKERI.md, Adım 3.
 * Referans: Mifflin-St Jeor denklemi + aktivite çarpanı.
 *
 * Saf fonksiyonlar: hem API hem mobil aynı sonucu üretsin diye burada,
 * paylaşılan pakette duruyor. Mobil tarafta anlık önizleme, API tarafında
 * kaydedilen değerin doğrulaması için kullanılıyor.
 *
 * ⚠️ Bu değerler genel bir tahmindir, tıbbi tavsiye değildir.
 */

export type BiologicalSex = "MALE" | "FEMALE";

export type TrainingFrequency =
  | "NEVER"
  | "ONE_TO_TWO"
  | "TWO_TO_THREE"
  | "FOUR_TO_FIVE"
  | "DAILY";

export type BodyGoal = "ATHLETIC" | "MUSCLE_GAIN" | "WEIGHT_LOSS" | "MAINTENANCE" | "FAT_LOSS";

/** docs/04'teki aktivite çarpanları. */
export const ACTIVITY_MULTIPLIER: Record<TrainingFrequency, number> = {
  NEVER: 1.2,
  ONE_TO_TWO: 1.375,
  TWO_TO_THREE: 1.465,
  FOUR_TO_FIVE: 1.55,
  DAILY: 1.725,
};

/**
 * Mifflin-St Jeor sabiti. Cinsiyet belirtilmemişse iki sabitin ortalaması
 * kullanılıyor — hesabı yapabilmek için bir değer gerekiyor ve kullanıcıyı
 * bu alanı doldurmaya zorlamıyoruz (KVKK veri asgarileştirmesi).
 * Sapma payı ±83 kcal.
 */
const SEX_CONSTANT: Record<BiologicalSex, number> = { MALE: 5, FEMALE: -161 };
const SEX_CONSTANT_UNSPECIFIED = (SEX_CONSTANT.MALE + SEX_CONSTANT.FEMALE) / 2; // -78

/**
 * Hedefe göre kalori ayarı (TDEE'ye oran olarak).
 * docs/04 aralık veriyor; her hedef için aralıktan tek bir değer sabitlendi:
 *   - Kilo verme: %15-20 aralığının ortası (%17.5) — sürdürülebilir açık.
 *   - Kas kazanımı: %10-15'in altı (%12) — fazla yağlanmadan artış.
 *   - Yağ yakımı: kilo vermeden daha ılımlı açık; kas korunmalı.
 *   - Atletik/sabit: TDEE'ye yakın.
 */
const CALORIE_ADJUSTMENT: Record<BodyGoal, number> = {
  WEIGHT_LOSS: -0.175,
  MUSCLE_GAIN: 0.12,
  FAT_LOSS: -0.1,
  ATHLETIC: 0.03,
  MAINTENANCE: 0,
};

/**
 * Protein hedefi (g / kg vücut ağırlığı).
 * docs/04: 1.6-2.2 aralığı, "kas kazanımında üst sınır".
 * Kalori açığı olan hedeflerde de protein yüksek tutuluyor — açıkta kas
 * kaybını sınırlayan ana etken bu.
 */
const PROTEIN_G_PER_KG: Record<BodyGoal, number> = {
  MUSCLE_GAIN: 2.2,
  WEIGHT_LOSS: 2.0,
  FAT_LOSS: 2.0,
  ATHLETIC: 1.9,
  MAINTENANCE: 1.6,
};

/** Yağ, toplam kalorinin %25-30'u. Ortası alındı. */
const FAT_CALORIE_SHARE = 0.275;

export const KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 } as const;

export interface MacroInput {
  age: number;
  heightCm: number;
  weightKg: number;
  biologicalSex?: BiologicalSex | null;
  trainingFrequency: TrainingFrequency;
  bodyGoal: BodyGoal;
}

export interface MacroTargets {
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
}

export function calculateBmr(input: MacroInput): number {
  const constant =
    input.biologicalSex === undefined || input.biologicalSex === null
      ? SEX_CONSTANT_UNSPECIFIED
      : SEX_CONSTANT[input.biologicalSex];

  return 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age + constant;
}

export function calculateTdee(input: MacroInput): number {
  return calculateBmr(input) * ACTIVITY_MULTIPLIER[input.trainingFrequency];
}

/**
 * Kalori ve makro hedeflerini hesaplar.
 *
 * Sıra önemli: önce protein (vücut ağırlığından), sonra yağ (kaloriden),
 * kalan kalori karbonhidrata gidiyor. Çok düşük kalorili senaryolarda protein
 * + yağ toplam kaloriyi aşabilir; o durumda karbonhidrat negatif olmasın diye
 * sıfıra kırpılıyor.
 */
export function calculateMacroTargets(input: MacroInput): MacroTargets {
  const bmr = calculateBmr(input);
  const tdee = bmr * ACTIVITY_MULTIPLIER[input.trainingFrequency];
  const targetCalories = Math.round(tdee * (1 + CALORIE_ADJUSTMENT[input.bodyGoal]));

  const targetProteinG = round1(input.weightKg * PROTEIN_G_PER_KG[input.bodyGoal]);
  const targetFatG = round1((targetCalories * FAT_CALORIE_SHARE) / KCAL_PER_G.fat);

  const remainingKcal =
    targetCalories - targetProteinG * KCAL_PER_G.protein - targetFatG * KCAL_PER_G.fat;
  const targetCarbsG = round1(Math.max(0, remainingKcal / KCAL_PER_G.carbs));

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories,
    targetProteinG,
    targetCarbsG,
    targetFatG,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** docs/04: hesaplama ekranının altında gösterilmesi zorunlu FYI metni. */
export const MACRO_DISCLAIMER =
  "Bu değerler Mifflin-St Jeor formülüne dayalı genel bir tahmindir. Kesin ihtiyacın için bir diyetisyene danışmanı öneririz.";
