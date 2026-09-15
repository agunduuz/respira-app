import { z } from "zod";

export const breathingTechniqueSchema = z.enum(["BOX", "FOUR_SEVEN_EIGHT", "DIAPHRAGMATIC"]);
export type BreathingTechnique = z.infer<typeof breathingTechniqueSchema>;

/** docs/07 → kabul kriteri: "nefes animasyonu seçilen tekniğin gerçek ritmiyle senkronize". */
export interface BreathingPhase {
  type: "inhale" | "hold" | "exhale";
  seconds: number;
}

export interface BreathingTechniqueDef {
  technique: BreathingTechnique;
  label: string;
  /** docs/07 tablosundaki "Uygulama" açıklaması. */
  instruction: string;
  /** docs/07 tablosundaki "Ne zaman önerilir". */
  whenToUse: string;
  phases: readonly BreathingPhase[];
  /** Bir döngünün toplam süresi (sn) — phases'in toplamı. */
  cycleSeconds: number;
  /** docs/07 → "5 Dakikalık Nefes Egzersizleri": ~300sn'yi aşmayan, tam döngü sayısına yuvarlanmış süre. */
  sessionDurationSeconds: number;
}

function cycleSeconds(phases: readonly BreathingPhase[]): number {
  return phases.reduce((sum, p) => sum + p.seconds, 0);
}

/** ~5 dakikayı aşmadan tam döngü sayısına yuvarlar; en az bir döngü garanti eder. */
function sessionDuration(phases: readonly BreathingPhase[], targetSeconds = 300): number {
  const cycle = cycleSeconds(phases);
  const cycles = Math.max(1, Math.floor(targetSeconds / cycle));
  return cycle * cycles;
}

function defineTechnique(
  technique: BreathingTechnique,
  label: string,
  instruction: string,
  whenToUse: string,
  phases: readonly BreathingPhase[]
): BreathingTechniqueDef {
  const cycle = cycleSeconds(phases);
  return {
    technique,
    label,
    instruction,
    whenToUse,
    phases,
    cycleSeconds: cycle,
    sessionDurationSeconds: sessionDuration(phases),
  };
}

/** docs/07 — "5 Dakikalık Nefes Egzersizleri" tablosu. */
export const BREATHING_TECHNIQUES: Record<BreathingTechnique, BreathingTechniqueDef> = {
  BOX: defineTechnique(
    "BOX",
    "Kutu nefesi",
    "4 sn nefes al – 4 sn tut – 4 sn ver – 4 sn tut, tekrarla",
    "Orta yoğunlukta stres, hızlı odaklanma gerektiğinde",
    [
      { type: "inhale", seconds: 4 },
      { type: "hold", seconds: 4 },
      { type: "exhale", seconds: 4 },
      { type: "hold", seconds: 4 },
    ]
  ),
  FOUR_SEVEN_EIGHT: defineTechnique(
    "FOUR_SEVEN_EIGHT",
    "4-7-8 tekniği",
    "4 sn nefes al – 7 sn tut – 8 sn ver",
    "Yüksek stres, sakinleşmeye ihtiyaç olduğunda",
    [
      { type: "inhale", seconds: 4 },
      { type: "hold", seconds: 7 },
      { type: "exhale", seconds: 8 },
    ]
  ),
  DIAPHRAGMATIC: defineTechnique(
    "DIAPHRAGMATIC",
    "Diyaframatik (karın) nefesi",
    "Burundan yavaş nefes al, karnın şişsin, ağızdan yavaş ver",
    "Düşük-orta stres, genel gevşeme",
    [
      { type: "inhale", seconds: 5 },
      { type: "exhale", seconds: 5 },
    ]
  ),
};

/**
 * docs/07 → stres seviyesine göre teknik önerisi.
 * 1-5 ölçek: 1-2 düşük, 3 orta, 4-5 yüksek.
 */
export function recommendTechnique(stressLevel: number): BreathingTechnique {
  if (stressLevel <= 2) return "DIAPHRAGMATIC";
  if (stressLevel === 3) return "BOX";
  return "FOUR_SEVEN_EIGHT";
}

export const stressLevelSchema = z.number().int().min(1).max(5);

/** docs/07 — "Günde kaç kez bu tür bir mola almak istersin?" hazır seçenekleri (1-2 / 3-4 / 5+). */
export const STRESS_SESSIONS_PER_DAY_PRESETS = [
  { value: 2, label: "1-2" },
  { value: 4, label: "3-4" },
  { value: 6, label: "5+" },
] as const;

export const stressProfileSchema = z.object({
  desiredSessionsPerDay: z.number().int().min(1).max(20),
});
export type StressProfileInput = z.infer<typeof stressProfileSchema>;

const sessionStatusSchema = z.enum(["COMPLETED", "SKIPPED", "MISSED"]);

export const recordBreathingSessionSchema = z.object({
  stressLevel: stressLevelSchema.nullable().optional(),
  technique: breathingTechniqueSchema,
  durationSeconds: z.number().int().min(1).max(3600),
  status: sessionStatusSchema,
  triggeredAt: z.string().datetime(),
});
export type RecordBreathingSessionInput = z.infer<typeof recordBreathingSessionSchema>;

/** docs/07 → "Yasal/Bilgilendirici Uyarı", her egzersiz/öneri ekranında sabit. */
export const STRESS_LEGAL_NOTICE =
  "Bu öneriler genel bilgilendirme amaçlıdır ve doktor desteğinin yerini tutmaz. Yoğun veya sürekli stres yaşıyorsan bir uzmana danışmanı öneririz.";

/** docs/07 → "Farklı Öneri Tipleri" — nefes egzersizi dışındaki alternatifler. */
export const STRESS_ALTERNATIVE_SUGGESTIONS = [
  {
    id: "walk",
    title: "Kısa yürüyüş",
    description: "Birkaç dakikalık bir yürüyüş, özellikle duruş molalarınla birleştirilebilir.",
  },
  {
    id: "stretch",
    title: "Kısa germe hareketleri",
    description: "Boyun, omuz ve bilek için birkaç yumuşak germe hareketi.",
  },
  {
    id: "mindfulness",
    title: "5-4-3-2-1 farkındalık",
    description:
      "Görebildiğin 5, dokunabildiğin 4, duyabildiğin 3, koklayabildiğin 2, tadabildiğin 1 şeyi fark et.",
  },
] as const;
