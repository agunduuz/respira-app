import { prisma } from "@respira/database";
import {
  dateKeySchema,
  previousDayReference,
  suggestNextMeal,
  type MacroTotals,
} from "@respira/shared-types";

import { HttpError, handle } from "@/lib/http";
import { toDateOnly } from "@/lib/nutrition";
import { requireDbUser } from "@/lib/user";

export const dynamic = "force-dynamic";

/**
 * docs/04 — öğün önerisi + ertesi gün referansı.
 *
 * ?date=YYYY-MM-DD&mealLabel=Öğle
 *
 * Kritik davranış: bugün hiç DETAYLI mod kaydı yoksa `consumedSoFar` null
 * geçiliyor ve genel tavsiye üretiliyor. Basit mod kayıtlarını sıfır sayıp
 * "hiç yemek yememişsin" gibi bir sayısal öneri vermek yanlış olurdu.
 */
export function GET(request: Request) {
  return handle(async () => {
    const user = await requireDbUser(request);
    const url = new URL(request.url);

    const key = dateKeySchema.parse(
      url.searchParams.get("date") ?? new Date().toISOString().slice(0, 10)
    );
    const mealLabel = (url.searchParams.get("mealLabel") ?? "Sonraki öğün").slice(0, 40);

    const profile = await prisma.nutritionProfile.findUnique({ where: { userId: user.id } });
    if (!profile) {
      throw new HttpError(409, "Önce beslenme anketini tamamlaman gerekiyor", "NO_PROFILE");
    }

    const date = toDateOnly(key);
    const previousDate = new Date(date);
    previousDate.setUTCDate(previousDate.getUTCDate() - 1);

    const [todayDetailed, todayAll, previousEntry] = await Promise.all([
      prisma.mealEntry.findMany({
        where: { userId: user.id, date, mode: "DETAILED" },
        select: { calories: true, proteinG: true, carbsG: true, fatG: true, fiberG: true },
      }),
      prisma.mealEntry.count({ where: { userId: user.id, date } }),
      prisma.mealEntry.findFirst({
        where: { userId: user.id, date: previousDate, mealLabel },
        orderBy: { createdAt: "desc" },
        select: { mode: true, proteinG: true },
      }),
    ]);

    const consumedSoFar: MacroTotals | null =
      todayDetailed.length === 0
        ? null
        : todayDetailed.reduce<MacroTotals>(
            (acc, e) => ({
              calories: acc.calories + (e.calories ?? 0),
              proteinG: acc.proteinG + (e.proteinG ?? 0),
              carbsG: acc.carbsG + (e.carbsG ?? 0),
              fatG: acc.fatG + (e.fatG ?? 0),
              fiberG: acc.fiberG + (e.fiberG ?? 0),
            }),
            { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 }
          );

    const remainingMeals = Math.max(1, profile.mealsPerDay - todayAll);

    const suggestion = suggestNextMeal({
      consumedSoFar,
      targets: {
        targetCalories: profile.targetCalories,
        targetProteinG: profile.targetProteinG,
        targetCarbsG: profile.targetCarbsG,
        targetFatG: profile.targetFatG,
      },
      nextMealLabel: mealLabel,
      remainingMeals,
    });

    const reference = previousDayReference({
      previousEntry,
      perMealProteinTargetG: profile.targetProteinG / Math.max(1, profile.mealsPerDay),
      mealLabel,
    });

    return { suggestion, previousDayReference: reference };
  });
}
