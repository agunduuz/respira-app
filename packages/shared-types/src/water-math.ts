/**
 * docs/06 — Su Tüketimi saf hesaplama mantığı. Expo/DB bağımlılığı yok,
 * bu yüzden doğrudan test edilebilir (bkz. nutrition-math.ts, posture-exercises.ts).
 */
import { WATER_ML_PER_KG } from "./water.ts";

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** docs/06 → "Önerilen su (ml) = kilo(kg) × 33". */
export function computeWaterGoalMl(weightKg: number): number {
  return Math.round(weightKg * WATER_ML_PER_KG);
}

/** Uyanıklık penceresi süresi (dakika). Uyku saati uyanma saatinden önce/eşitse
 *  dejenere bir pencere kabul edilip tüm hedef anında beklenir (aşağıya bkz.). */
function awakeMinutes(wakeTime: string, sleepTime: string): number {
  return Math.max(1, toMinutes(sleepTime) - toMinutes(wakeTime));
}

/** docs/06 → "Saatlik hedef = Günlük hedef / uyanık saat sayısı". */
export function computeHourlyTargetMl(params: {
  dailyTargetMl: number;
  wakeTime: string;
  sleepTime: string;
}): number {
  const { dailyTargetMl, wakeTime, sleepTime } = params;
  const minutes = awakeMinutes(wakeTime, sleepTime);
  return Math.round(dailyTargetMl / (minutes / 60));
}

/**
 * "Şu ana kadar içmen gereken" referans miktarı (docs/06).
 * Uyanmadan önce 0, uyku saatinden sonra tam hedef, aradaki dilimde ise
 * geçen süreyle orantılı.
 */
export function computeExpectedIntakeMl(params: {
  dailyTargetMl: number;
  wakeTime: string;
  sleepTime: string;
  now: Date;
}): number {
  const { dailyTargetMl, wakeTime, sleepTime, now } = params;
  const wake = toMinutes(wakeTime);
  const sleep = toMinutes(sleepTime);
  const current = now.getHours() * 60 + now.getMinutes();

  if (current <= wake) return 0;
  if (current >= sleep) return dailyTargetMl;

  const elapsed = current - wake;
  return Math.round(dailyTargetMl * (elapsed / awakeMinutes(wakeTime, sleepTime)));
}
