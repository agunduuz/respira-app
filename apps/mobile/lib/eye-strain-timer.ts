/**
 * Sayaç durumunun saf mantığı. docs/03 → "Sayaç arka planda da çalışmalı —
 * uygulama minimize edildiğinde saymayı kaybetmemeli."
 *
 * Bu yüzden geri sayım bir setInterval sayacıyla TUTULMUYOR. Sadece "ne zaman
 * başladı" saklanıyor; kalan süre her render'da duvar saatinden hesaplanıyor.
 * Uygulama arka plana atılıp geri geldiğinde sayaç doğru yerde oluyor.
 */

export type TimerPhase = "idle" | "working" | "breaking";

export interface TimerState {
  phase: TimerPhase;
  /** Mevcut fazın başladığı an (ms). idle'da null. */
  startedAt: number | null;
}

export interface TimerView {
  phase: TimerPhase;
  /** Fazın bitmesine kalan saniye (aşağı yuvarlanmış, negatif olmaz). */
  remainingSeconds: number;
  /** 0-1 arası ilerleme — dairesel göstergeyi bu besliyor. */
  progress: number;
  /** Faz süresi dolmuş mu? */
  elapsed: boolean;
}

export interface TimerDurations {
  intervalMinutes: number;
  breakSeconds: number;
}

function phaseDurationSeconds(phase: TimerPhase, d: TimerDurations): number {
  if (phase === "working") return d.intervalMinutes * 60;
  if (phase === "breaking") return d.breakSeconds;
  return 0;
}

export function viewTimer(state: TimerState, durations: TimerDurations, now: number): TimerView {
  if (state.phase === "idle" || state.startedAt === null) {
    return { phase: "idle", remainingSeconds: 0, progress: 0, elapsed: false };
  }

  const total = phaseDurationSeconds(state.phase, durations);
  const elapsedSeconds = (now - state.startedAt) / 1000;
  const remaining = Math.max(0, total - elapsedSeconds);

  return {
    phase: state.phase,
    remainingSeconds: Math.ceil(remaining),
    // total 0 olamaz (şema alt sınır koyuyor) ama bölme güvenliği için yine de.
    progress: total > 0 ? Math.min(1, Math.max(0, elapsedSeconds / total)) : 1,
    elapsed: remaining <= 0,
  };
}

/** "12:05" biçiminde sayaç metni. Bir saatten uzun süre beklenmediği için mm:ss. */
export function formatRemaining(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
