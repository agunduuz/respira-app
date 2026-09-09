import { prisma } from "@respira/database";
import type { MacroTotals } from "@respira/shared-types";

/**
 * Bir günün öğün kayıtlarından toplam makroları çıkarır ve özet tablosunu
 * günceller.
 *
 * docs/04: yalnızca DETAYLI mod kayıtlarının sayısal değeri var. Basit mod
 * kayıtları toplama girmez — girerse "0 kalori yedi" gibi yanlış bir sonuç
 * çıkar ve raporlar bozulur.
 */
export async function recalculateDailySummary(userId: string, date: Date): Promise<MacroTotals> {
  const entries = await prisma.mealEntry.findMany({
    where: { userId, date, mode: "DETAILED" },
    select: { calories: true, proteinG: true, carbsG: true, fatG: true, fiberG: true },
  });

  // Generic açıkça verilmezse TypeScript akümülatörü dizi elemanının
  // nullable tipinden çıkarıyor.
  const totals = entries.reduce<MacroTotals>(
    (acc, e) => ({
      calories: acc.calories + (e.calories ?? 0),
      proteinG: acc.proteinG + (e.proteinG ?? 0),
      carbsG: acc.carbsG + (e.carbsG ?? 0),
      fatG: acc.fatG + (e.fatG ?? 0),
      fiberG: acc.fiberG + (e.fiberG ?? 0),
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 }
  );

  if (entries.length === 0) {
    // Gün boyunca detaylı kayıt kalmadıysa özet satırını da kaldır —
    // aksi halde raporlarda sıfırlı bir gün görünür.
    await prisma.dailyNutritionSummary.deleteMany({ where: { userId, date } });
    return totals;
  }

  await prisma.dailyNutritionSummary.upsert({
    where: { userId_date: { userId, date } },
    create: {
      userId,
      date,
      totalCalories: Math.round(totals.calories),
      totalProteinG: totals.proteinG,
      totalCarbsG: totals.carbsG,
      totalFatG: totals.fatG,
      totalFiberG: totals.fiberG,
    },
    update: {
      totalCalories: Math.round(totals.calories),
      totalProteinG: totals.proteinG,
      totalCarbsG: totals.carbsG,
      totalFatG: totals.fatG,
      totalFiberG: totals.fiberG,
    },
  });

  return totals;
}

/** "YYYY-MM-DD" → Date (UTC gün başı). @db.Date kolonları böyle saklanıyor. */
export function toDateOnly(key: string): Date {
  return new Date(`${key}T00:00:00.000Z`);
}

export function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}
