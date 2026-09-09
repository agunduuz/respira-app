import { prisma } from "@respira/database";

import { handle } from "@/lib/http";
import { consume } from "@/lib/rate-limit";
import { requireDbUser } from "@/lib/user";

export const dynamic = "force-dynamic";

/**
 * KVKK md. 11 — verilerin dışa aktarılması.
 *
 * YENİ ÖZELLİK EKLERKEN: kullanıcıya ait her yeni tablo buraya da eklenmeli.
 * Eksik bırakılan bir tablo, kullanıcının yasal hakkının eksik karşılanması
 * demek. Şu an kapsananlar: rızalar, bildirim tercihleri, günlük raporlar,
 * göz yorgunluğu, beslenme. Eksik: su, postür, stres (docs/05-07).
 */
export function GET(request: Request) {
  return handle(async () => {
    const user = await requireDbUser(request);
    // Dışa aktarma ağır bir sorgu ve kötüye kullanıma açık — sıkı sınır.
    consume(`export:${user.id}`, { limit: 5, windowMs: 60 * 60_000 });

    const [
      consents,
      notificationPrefs,
      dailyReports,
      eyeStrainSettings,
      eyeStrainSessions,
      nutritionProfile,
      mealEntries,
      dailyNutrition,
    ] = await Promise.all([
      prisma.consentRecord.findMany({ where: { userId: user.id }, orderBy: { grantedAt: "asc" } }),
      prisma.notificationPreference.findMany({ where: { userId: user.id } }),
      prisma.dailyReport.findMany({ where: { userId: user.id }, orderBy: { date: "asc" } }),
      prisma.eyeStrainSettings.findUnique({ where: { userId: user.id } }),
      prisma.eyeStrainSession.findMany({
        where: { userId: user.id },
        orderBy: { triggeredAt: "asc" },
      }),
      prisma.nutritionProfile.findUnique({ where: { userId: user.id } }),
      prisma.mealEntry.findMany({ where: { userId: user.id }, orderBy: { date: "asc" } }),
      prisma.dailyNutritionSummary.findMany({
        where: { userId: user.id },
        orderBy: { date: "asc" },
      }),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      formatVersion: 2,
      account: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      },
      consents,
      notificationPreferences: notificationPrefs,
      dailyReports,
      eyeStrain: { settings: eyeStrainSettings, sessions: eyeStrainSessions },
      nutrition: {
        profile: nutritionProfile,
        mealEntries,
        dailySummaries: dailyNutrition,
      },
    };
  });
}
