import { z } from "zod";

/** "2026-09" — profil takviminin gösterdiği ay. */
export const activityMonthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Ay 'YYYY-MM' biçiminde olmalı");

export interface ActivityDay {
  /** Kullanıcının yerel gününe göre "YYYY-MM-DD". */
  date: string;
  eyeCompleted: number;
  waterMl: number;
  postureCompleted: number;
  breathingCompleted: number;
  meals: number;
}

export interface ActivityTotals {
  eyeCompleted: number;
  /** Su hedefine ulaşılan gün sayısı (hedef tanımlıysa). */
  waterDaysOnTarget: number;
  postureCompleted: number;
  breathingCompleted: number;
  /** En az bir kayıt bulunan gün sayısı. */
  activeDays: number;
}

export interface ActivityMonth {
  month: string;
  /** Yalnızca kaydı olan günler döner; kalan günler boş kabul edilir. */
  days: ActivityDay[];
  /**
   * Kullanıcının GÜNCEL su hedefi. Geçmiş günler o günkü hedefe göre değil,
   * bugünkü hedefe göre değerlendirilir — hedef geçmişi tutulmuyor.
   */
  waterTargetMl: number | null;
  totals: ActivityTotals;
}

/** O gün kaç alışkanlığın tamamlandığı (0-4) — takvimdeki doluluk bunu gösterir. */
export function completedHabits(day: ActivityDay, waterTargetMl: number | null): number {
  return (
    (day.eyeCompleted > 0 ? 1 : 0) +
    (waterTargetMl && day.waterMl >= waterTargetMl ? 1 : 0) +
    (day.postureCompleted > 0 ? 1 : 0) +
    (day.breathingCompleted > 0 ? 1 : 0)
  );
}

export const HABITS_PER_DAY = 4;
