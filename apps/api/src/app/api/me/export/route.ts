import { prisma } from "@respira/database";

import { handle } from "@/lib/http";
import { consume } from "@/lib/rate-limit";
import { requireDbUser } from "@/lib/user";

export const dynamic = "force-dynamic";

/**
 * KVKK md. 11 — verilerin dışa aktarılması.
 *
 * Özellikler eklendikçe (öğün kayıtları, su, postür...) buradaki `include`
 * genişletilmeli. Eksik bırakılan bir tablo, kullanıcının yasal hakkının
 * eksik karşılanması demek.
 */
export function GET(request: Request) {
  return handle(async () => {
    const user = await requireDbUser(request);
    // Dışa aktarma ağır bir sorgu ve kötüye kullanıma açık — sıkı sınır.
    consume(`export:${user.id}`, { limit: 5, windowMs: 60 * 60_000 });

    const [consents, notificationPrefs, dailyReports] = await Promise.all([
      prisma.consentRecord.findMany({ where: { userId: user.id }, orderBy: { grantedAt: "asc" } }),
      prisma.notificationPreference.findMany({ where: { userId: user.id } }),
      prisma.dailyReport.findMany({ where: { userId: user.id }, orderBy: { date: "asc" } }),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      formatVersion: 1,
      account: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      },
      consents,
      notificationPreferences: notificationPrefs,
      dailyReports,
    };
  });
}
