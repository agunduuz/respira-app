import { prisma } from "@respira/database";
import { recordEyeStrainSessionsSchema } from "@respira/shared-types";

import { HttpError, handle, parseBody } from "@/lib/http";
import { consume } from "@/lib/rate-limit";
import { requireDbUser } from "@/lib/user";

export const dynamic = "force-dynamic";

/** İleri tarihli kayıt kabul etmiyoruz — saati ileri alınmış cihaz analizi bozar. */
const MAX_FUTURE_SKEW_MS = 5 * 60_000;

/**
 * Mola sonuçlarını kaydeder. Uygulama kapalıyken kaçırılan molalar sonradan
 * toplu gönderilebildiği için gövde bir dizi alıyor.
 */
export function POST(request: Request) {
  return handle<{ recorded: number }>(async () => {
    const user = await requireDbUser(request);
    consume(`eye-sessions:${user.id}`, { limit: 60, windowMs: 60_000 });

    const { sessions } = await parseBody(request, recordEyeStrainSessionsSchema);

    const now = Date.now();
    const rows = sessions.map((s) => {
      const triggeredAt = new Date(s.triggeredAt);
      if (triggeredAt.getTime() > now + MAX_FUTURE_SKEW_MS) {
        throw new HttpError(400, "Gelecek tarihli seans kaydedilemez", "FUTURE_TIMESTAMP");
      }
      return { userId: user.id, status: s.status, triggeredAt };
    });

    // Aynı molanın iki kez gönderilmesi (ağ tekrarı) analizi şişirmesin diye
    // aynı saniyeye denk gelen kayıtlar atlanıyor.
    const result = await prisma.eyeStrainSession.createMany({
      data: rows,
      skipDuplicates: true,
    });

    return { recorded: result.count };
  });
}
