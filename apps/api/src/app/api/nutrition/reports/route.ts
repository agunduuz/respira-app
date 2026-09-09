import { prisma } from "@respira/database";
import { nutritionPeriodSchema } from "@respira/shared-types";

import { HttpError, handle } from "@/lib/http";
import { toDateKey } from "@/lib/nutrition";
import { requireDbUser } from "@/lib/user";

export const dynamic = "force-dynamic";

const SPAN_DAYS = { daily: 1, weekly: 7, monthly: 30 } as const;

/**
 * docs/04 raporlama.
 *
 * Kullanıcının açık isteği: haftalık/aylık raporlar ÖĞÜNLERİN KENDİSİNİ değil,
 * DEĞERLERİN karşılaştırmasını gösterir. Bu yüzden bu endpoint hiçbir zaman
 * öğün metni veya içerik detayı döndürmüyor — yalnızca günlük toplamlar ve
 * hedefle kıyas.
 */
export function GET(request: Request) {
  return handle(async () => {
    const user = await requireDbUser(request);
    const url = new URL(request.url);
    const period = nutritionPeriodSchema.parse(url.searchParams.get("period") ?? "weekly");

    const profile = await prisma.nutritionProfile.findUnique({ where: { userId: user.id } });
    if (!profile) {
      throw new HttpError(409, "Önce beslenme anketini tamamlaman gerekiyor", "NO_PROFILE");
    }

    const days = SPAN_DAYS[period];
    const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z");
    const from = new Date(today);
    from.setUTCDate(from.getUTCDate() - (days - 1));

    const summaries = await prisma.dailyNutritionSummary.findMany({
      where: { userId: user.id, date: { gte: from, lte: today } },
      orderBy: { date: "asc" },
    });

    const byDate = new Map(summaries.map((s) => [toDateKey(s.date), s]));

    // Kayıt olmayan günler de dönüyor: grafikte boşluk görünmeli, gün atlanmamalı.
    const buckets = Array.from({ length: days }, (_, i) => {
      const d = new Date(from);
      d.setUTCDate(d.getUTCDate() + i);
      const key = toDateKey(d);
      const s = byDate.get(key);
      return {
        key,
        hasData: !!s,
        calories: s?.totalCalories ?? null,
        proteinG: s?.totalProteinG ?? null,
        carbsG: s?.totalCarbsG ?? null,
        fatG: s?.totalFatG ?? null,
        fiberG: s?.totalFiberG ?? null,
      };
    });

    const withData = buckets.filter((b) => b.hasData);
    const avg = (pick: (b: (typeof buckets)[number]) => number | null) =>
      withData.length === 0
        ? null
        : Math.round((withData.reduce((a, b) => a + (pick(b) ?? 0), 0) / withData.length) * 10) / 10;

    const averages = {
      calories: avg((b) => b.calories),
      proteinG: avg((b) => b.proteinG),
      carbsG: avg((b) => b.carbsG),
      fatG: avg((b) => b.fatG),
      fiberG: avg((b) => b.fiberG),
    };

    const pct = (actual: number | null, target: number) =>
      actual === null || target === 0 ? null : Math.round((actual / target) * 100);

    return {
      period,
      from: toDateKey(from),
      to: toDateKey(today),
      targets: {
        calories: profile.targetCalories,
        proteinG: profile.targetProteinG,
        carbsG: profile.targetCarbsG,
        fatG: profile.targetFatG,
      },
      averages,
      /** Hedefe göre yüzde — docs/04: "haftalık ortalama protein alımın hedefe göre %X". */
      vsTarget: {
        calories: pct(averages.calories, profile.targetCalories),
        proteinG: pct(averages.proteinG, profile.targetProteinG),
        carbsG: pct(averages.carbsG, profile.targetCarbsG),
        fatG: pct(averages.fatG, profile.targetFatG),
      },
      daysWithData: withData.length,
      buckets,
    };
  });
}
