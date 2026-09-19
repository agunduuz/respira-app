import { prisma } from "@respira/database";

import { HttpError, handle } from "@/lib/http";
import { requireDbUser } from "@/lib/user";

export const dynamic = "force-dynamic";

/** Yanlışlıkla eklenen bir su girişini geri almak için (docs/06). */
export async function DELETE(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return handle(async () => {
    const user = await requireDbUser(request);
    const log = await prisma.waterIntakeLog.findUnique({ where: { id } });
    if (!log || log.userId !== user.id) {
      // Başkasının kaydı da "bulunamadı" döner — varlığını sızdırmıyoruz.
      throw new HttpError(404, "Kayıt bulunamadı");
    }
    await prisma.waterIntakeLog.delete({ where: { id: log.id } });
    return { deleted: true };
  });
}
