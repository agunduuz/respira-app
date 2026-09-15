import type { BreathingPhase } from "@respira/shared-types";

/**
 * Nefes egzersizinin saf zamanlama mantığı — expo bağımlılığı yok, doğrudan
 * test edilebilir. Görsel (Skia/Reanimated) tarafı BreathingOrb içinde;
 * bu dosya yalnızca "şu an hangi faz, kaç saniye kaldı" hesabını yapıyor.
 */

export interface BreathingCycleState {
  phaseIndex: number;
  phase: BreathingPhase;
  /** Bu fazda geçen süre (sn), 0'dan faz süresine kadar. */
  elapsedInPhase: number;
  /** Bu fazda kalan tam saniye — ekranda geri sayım için yukarı yuvarlanır. */
  remainingInPhase: number;
  /** 0-1 arası, faz içindeki ilerleme — dolgu/animasyon için. */
  phaseProgress: number;
}

export function cycleSeconds(phases: readonly BreathingPhase[]): number {
  return phases.reduce((sum, p) => sum + p.seconds, 0);
}

/**
 * Egzersiz başladığından bu yana geçen süreye göre hangi fazda olunduğunu
 * bulur. Döngü bitince başa sarar (withRepeat'in JS tarafındaki karşılığı).
 */
export function breathingStateAt(
  phases: readonly BreathingPhase[],
  elapsedSeconds: number
): BreathingCycleState {
  const total = cycleSeconds(phases);
  // Negatif/az miktarda kayan nokta sapmasına karşı güvenli mod alma.
  const t = ((elapsedSeconds % total) + total) % total;

  let acc = 0;
  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    if (t < acc + phase.seconds) {
      const elapsedInPhase = t - acc;
      return {
        phaseIndex: i,
        phase,
        elapsedInPhase,
        remainingInPhase: Math.ceil(phase.seconds - elapsedInPhase),
        phaseProgress: phase.seconds > 0 ? elapsedInPhase / phase.seconds : 1,
      };
    }
    acc += phase.seconds;
  }

  // Kayan nokta sapması son fazı kaçırırsa güvenlik ağı: sona düş.
  const last = phases[phases.length - 1];
  return {
    phaseIndex: phases.length - 1,
    phase: last,
    elapsedInPhase: last.seconds,
    remainingInPhase: 0,
    phaseProgress: 1,
  };
}

export const PHASE_LABELS: Record<BreathingPhase["type"], string> = {
  inhale: "Nefes al",
  hold: "Tut",
  exhale: "Ver",
};
