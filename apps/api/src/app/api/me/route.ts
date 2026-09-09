import { prisma } from "@respira/database";
import { deleteAccountSchema } from "@respira/shared-types";

import { requireUser } from "@/lib/auth";
import { HttpError, handle, parseBody } from "@/lib/http";
import { consume } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * KVKK md. 11 — hesabın ve tüm verilerin silinmesi. Geri dönüşü yok.
 *
 * İki ayrı sistemden siliniyor:
 *   1. Uygulama veritabanı (Prisma) — ilişkiler onDelete: Cascade
 *   2. Supabase Auth kullanıcısı — service role gerektirir
 *
 * Sıra önemli: önce uygulama verisi, sonra kimlik. Tersi olursa, auth silinip
 * veri silinemezse ortada sahipsiz sağlık verisi kalır.
 */
export function DELETE(request: Request) {
  return handle<{ deleted: true }>(async () => {
    const { authId } = await requireUser(request);
    consume(`delete-account:${authId}`, { limit: 3, windowMs: 60 * 60_000 });

    const input = await parseBody(request, deleteAccountSchema);
    void input; // şema literal doğrulaması yeterli — ayrıca kullanılmıyor

    const user = await prisma.user.findUnique({ where: { authId } });
    if (user) {
      await prisma.user.delete({ where: { id: user.id } });
    }

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(authId);
    if (error) {
      // Uygulama verisi gitti ama kimlik duruyor. Kullanıcı tekrar giriş
      // yaparsa boş bir hesap görür; sessizce başarı dönmek yanlış olur.
      throw new HttpError(
        500,
        "Verilerin silindi ancak hesap kaydı kaldırılamadı. Lütfen destek ile iletişime geç.",
        "AUTH_DELETE_FAILED"
      );
    }

    return { deleted: true };
  });
}
