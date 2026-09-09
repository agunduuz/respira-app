import { prisma } from "@respira/database";
import { toggleFavoriteSchema } from "@respira/shared-types";

import { HttpError, handle, parseBody } from "@/lib/http";
import { recalculateDailySummary } from "@/lib/nutrition";
import { requireDbUser } from "@/lib/user";

export const dynamic = "force-dynamic";

/** Kaydın gerçekten bu kullanıcıya ait olduğunu doğrular (defense in depth). */
async function requireOwnMeal(request: Request, id: string) {
  const user = await requireDbUser(request);
  const meal = await prisma.mealEntry.findUnique({ where: { id } });
  if (!meal || meal.userId !== user.id) {
    // Başkasının kaydı da "bulunamadı" döner — varlığını sızdırmıyoruz.
    throw new HttpError(404, "Öğün bulunamadı");
  }
  return { user, meal };
}

/** docs/04 — favoriye ekleme/çıkarma. Favori kayıtların ham içeriği silinmez. */
export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return handle(async () => {
    const { meal } = await requireOwnMeal(request, id);
    const input = await parseBody(request, toggleFavoriteSchema);

    const updated = await prisma.mealEntry.update({
      where: { id: meal.id },
      data: { isFavorite: input.isFavorite },
    });
    return { meal: updated };
  });
}

export async function DELETE(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return handle(async () => {
    const { user, meal } = await requireOwnMeal(request, id);
    await prisma.mealEntry.delete({ where: { id: meal.id } });
    // Silinen öğün toplamlardan da düşmeli.
    await recalculateDailySummary(user.id, meal.date);
    return { deleted: true };
  });
}
