import { prisma } from "@respira/database";
import { dateKeySchema, mealEntrySchema } from "@respira/shared-types";

import { handle, parseBody } from "@/lib/http";
import { recalculateDailySummary, toDateOnly } from "@/lib/nutrition";
import { consume } from "@/lib/rate-limit";
import { requireDbUser } from "@/lib/user";

export const dynamic = "force-dynamic";

/** Bir günün öğünleri. ?date=YYYY-MM-DD (varsayılan: bugün) */
export function GET(request: Request) {
  return handle(async () => {
    const user = await requireDbUser(request);
    const url = new URL(request.url);
    const key = dateKeySchema.parse(
      url.searchParams.get("date") ?? new Date().toISOString().slice(0, 10)
    );

    const [meals, summary] = await Promise.all([
      prisma.mealEntry.findMany({
        where: { userId: user.id, date: toDateOnly(key) },
        orderBy: { createdAt: "asc" },
      }),
      prisma.dailyNutritionSummary.findUnique({
        where: { userId_date: { userId: user.id, date: toDateOnly(key) } },
      }),
    ]);

    return { date: key, meals, summary };
  });
}

export function POST(request: Request) {
  return handle(async () => {
    const user = await requireDbUser(request);
    consume(`meals:${user.id}`, { limit: 120, windowMs: 60_000 });

    const input = await parseBody(request, mealEntrySchema);
    const date = toDateOnly(input.date);

    const meal = await prisma.mealEntry.create({
      data: {
        userId: user.id,
        date,
        mealLabel: input.mealLabel,
        mode: input.mode,
        rawText: input.rawText ?? null,
        foodItemsDetail: input.foodItemsDetail ?? undefined,
        calories: input.calories ?? null,
        proteinG: input.proteinG ?? null,
        carbsG: input.carbsG ?? null,
        fatG: input.fatG ?? null,
        fiberG: input.fiberG ?? null,
        isFavorite: input.isFavorite,
      },
    });

    const totals = await recalculateDailySummary(user.id, date);
    return { meal, totals };
  });
}
