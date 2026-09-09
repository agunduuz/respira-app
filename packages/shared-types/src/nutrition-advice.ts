/**
 * Öğün önerisi ve ertesi gün referans mantığı — docs/04.
 *
 * KRİTİK KURAL (docs/04 kabul kriteri): basit modda (yalnızca serbest metin)
 * sayısal veri YOKTUR. Bu dosyadaki hiçbir fonksiyon basit mod girdisinden
 * sayısal çıkarım yapmaz; o durumda genel dengeleme tavsiyesi döner.
 */

export type MealMode = "SIMPLE" | "DETAILED";

export interface MacroTotals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export interface MacroTargetsLite {
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
}

/** docs/04: öneri HER ZAMAN bu ifadeyle birlikte gösterilir. */
export const DIETITIAN_DISCLAIMER =
  "Bu bir öneridir. Doğru ve kişiselleştirilmiş beslenme kararları için bir diyetisyene danışmanı tavsiye ederiz.";

export interface MealSuggestion {
  /**
   * "numeric": detaylı mod verisine dayalı sayısal karşılaştırma.
   * "general": sayısal veri yok, genel dengeleme tavsiyesi.
   */
  basis: "numeric" | "general";
  message: string;
  /** Yalnızca numeric'te dolu — kalan hedef (negatifse hedef aşılmış). */
  gaps?: { calories: number; proteinG: number; carbsG: number; fatG: number };
  disclaimer: string;
}

/**
 * Yaygın protein kaynakları ve porsiyon başına yaklaşık protein değerleri.
 * Öneriyi somutlaştırmak için — "20 g protein ekle" yerine "2 yumurta" demek
 * kullanıcı için uygulanabilir.
 *
 * Değerler yaklaşıktır; kesin besin veritabanı entegrasyonu V2 konusu.
 */
const PROTEIN_SOURCES: { label: string; proteinG: number }[] = [
  { label: "1 kase (200 g) yoğurt", proteinG: 10 },
  { label: "2 adet yumurta", proteinG: 12 },
  { label: "30 g beyaz peynir", proteinG: 7 },
  { label: "1 kase (200 g) pişmiş mercimek", proteinG: 18 },
  { label: "100 g tavuk göğsü", proteinG: 31 },
];

/** Eksik proteini kabaca karşılayan en yakın tek porsiyonu seçer. */
function suggestProteinSource(gapG: number): string {
  let best = PROTEIN_SOURCES[0];
  let bestDiff = Infinity;
  for (const s of PROTEIN_SOURCES) {
    const diff = Math.abs(s.proteinG - gapG);
    if (diff < bestDiff) {
      best = s;
      bestDiff = diff;
    }
  }
  return best.label;
}

const GENERAL_ADVICE: Record<string, string> = {
  default:
    "Sonraki öğünde tabağının yarısını sebze, dörtte birini protein, dörtte birini tam tahıl yapmak dengeli bir başlangıç.",
  breakfast:
    "Güne protein içeren bir kahvaltıyla başlamak, gün içindeki atıştırma isteğini azaltmaya yardımcı olabilir.",
  lunch:
    "Kahvaltında proteine ağırlık verdiysen öğlen sebze ağırlıklı gitmek dengeleyici olabilir.",
  dinner:
    "Akşam öğününde ağır ve yağlı seçenekler yerine hafif protein ve sebze tercih etmek uykuya geçişi kolaylaştırabilir.",
};

function adviceKeyFor(mealLabel: string): string {
  const l = mealLabel.toLocaleLowerCase("tr-TR");
  if (l.includes("kahvalt")) return "breakfast";
  if (l.includes("öğle")) return "lunch";
  if (l.includes("akşam")) return "dinner";
  return "default";
}

export interface SuggestParams {
  /**
   * Bugün şu ana kadar alınan makrolar. Detaylı mod girişi yoksa (yalnızca
   * basit mod kullanıldıysa) null geçilmeli — bu durumda sayısal öneri
   * üretilmez.
   */
  consumedSoFar: MacroTotals | null;
  targets: MacroTargetsLite;
  /** Öneri hangi öğün için — metni kişiselleştirmek üzere. */
  nextMealLabel: string;
  /** Gün içinde kalan öğün sayısı (bu öğün dahil). En az 1. */
  remainingMeals: number;
}

export function suggestNextMeal(params: SuggestParams): MealSuggestion {
  const { consumedSoFar, targets, nextMealLabel, remainingMeals } = params;

  if (consumedSoFar === null) {
    return {
      basis: "general",
      message: GENERAL_ADVICE[adviceKeyFor(nextMealLabel)],
      disclaimer: DIETITIAN_DISCLAIMER,
    };
  }

  const gaps = {
    calories: targets.targetCalories - consumedSoFar.calories,
    proteinG: round1(targets.targetProteinG - consumedSoFar.proteinG),
    carbsG: round1(targets.targetCarbsG - consumedSoFar.carbsG),
    fatG: round1(targets.targetFatG - consumedSoFar.fatG),
  };

  const share = Math.max(1, remainingMeals);
  const proteinThisMeal = round1(gaps.proteinG / share);

  let message: string;
  if (gaps.calories <= 0) {
    message = `Günlük kalori hedefini zaten karşıladın. ${nextMealLabel} için hafif ve sebze ağırlıklı bir seçenek dengeleyici olabilir.`;
  } else if (proteinThisMeal > 5) {
    message =
      `${nextMealLabel} için yaklaşık ${proteinThisMeal} g protein hedefleyebilirsin — ` +
      `örneğin ${suggestProteinSource(proteinThisMeal)}. ` +
      `Günün kalanında ${gaps.calories} kcal alanın var.`;
  } else {
    message =
      `Protein hedefine yaklaştın. ${nextMealLabel} için kalan ${gaps.calories} kcal'i ` +
      `sebze ve tam tahıl ağırlıklı doldurmak lif alımına iyi gelir.`;
  }

  return { basis: "numeric", message, gaps, disclaimer: DIETITIAN_DISCLAIMER };
}

export interface PreviousDayEntry {
  mode: MealMode;
  proteinG: number | null;
}

export interface PreviousDayParams {
  /** Dünkü aynı isimli öğün kaydı; yoksa null. */
  previousEntry: PreviousDayEntry | null;
  /** Bu öğün için beklenen protein (günlük hedef / öğün sayısı). */
  perMealProteinTargetG: number;
  mealLabel: string;
}

/**
 * docs/04 "Ertesi Gün Referans Alma".
 *
 * Yalnızca DETAILED mod verisiyle çalışır. Basit modda ya da kayıt yoksa null
 * döner — kabul kriteri: "basit moddan yanlış sayısal çıkarım yapmıyor".
 */
export function previousDayReference(params: PreviousDayParams): string | null {
  const { previousEntry, perMealProteinTargetG, mealLabel } = params;

  if (!previousEntry) return null;
  if (previousEntry.mode !== "DETAILED") return null;
  if (previousEntry.proteinG === null) return null;

  const gap = perMealProteinTargetG - previousEntry.proteinG;
  // Küçük sapmalar için kullanıcıyı uyarmak gereksiz gürültü; %20'den fazla
  // geride kalındığında somut bir telafi öneriyoruz.
  if (gap <= perMealProteinTargetG * 0.2) return null;

  return (
    `Dün ${mealLabel.toLocaleLowerCase("tr-TR")} öğünün hedefindeki proteinin altında kaldı ` +
    `(${round1(previousEntry.proteinG)} g / ${round1(perMealProteinTargetG)} g). ` +
    `Bugün tabağına ek olarak ${suggestProteinSource(gap)} eklemeyi düşünebilirsin.`
  );
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
