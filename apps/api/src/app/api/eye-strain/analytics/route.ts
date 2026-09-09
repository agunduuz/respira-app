import { Prisma, prisma } from "@respira/database";
import {
  complianceRate,
  eyeStrainPeriodSchema,
  timeZoneSchema,
  type EyeStrainAnalytics,
  type EyeStrainBucket,
} from "@respira/shared-types";

import { handle } from "@/lib/http";
import { requireDbUser } from "@/lib/user";

export const dynamic = "force-dynamic";

/** Her dönem için: kaç kova, kova genişliği ve geriye kaç birim bakılacağı. */
const PERIODS = {
  daily: { unit: "hour", span: "1 day", buckets: 24 },
  weekly: { unit: "day", span: "7 days", buckets: 7 },
  monthly: { unit: "day", span: "30 days", buckets: 30 },
} as const;

type Row = { bucket: Date; status: string; count: bigint };

export function GET(request: Request) {
  return handle<EyeStrainAnalytics>(async () => {
    const user = await requireDbUser(request);

    const url = new URL(request.url);
    const period = eyeStrainPeriodSchema.parse(url.searchParams.get("period") ?? "weekly");
    const tz = timeZoneSchema.parse(url.searchParams.get("tz") ?? "UTC");

    const { unit, span, buckets: bucketCount } = PERIODS[period];

    /*
     * Gün/saat sınırları kullanıcının yerel saatine göre kesiliyor:
     * timestamp'i önce o saat dilimine çevirip date_trunc uyguluyoruz.
     *
     * unit ve span sabit listeden geliyor (kullanıcı girdisi değil); tz ise
     * kullanıcıdan geliyor ve parametre olarak bağlanıyor — string olarak
     * gömülmüyor. Geçersiz bir tz'de Postgres hata verir, sessizce UTC'ye
     * düşmez; bu istenen davranış.
     */
    const rows = await prisma.$queryRaw<Row[]>`
      SELECT
        date_trunc(${unit}, "triggeredAt" AT TIME ZONE ${tz}) AS bucket,
        "status"::text AS status,
        count(*) AS count
      FROM "eye_strain_sessions"
      WHERE "userId" = ${user.id}
        AND "triggeredAt" >= (now() - ${Prisma.raw(`INTERVAL '${span}'`)})
      GROUP BY 1, 2
      ORDER BY 1
    `;

    // Boş kovaları da döndürüyoruz — grafikte "veri yok" günleri görünmeli.
    const byKey = new Map<string, { completed: number; skipped: number; missed: number }>();
    const keyOf = (d: Date) =>
      period === "daily" ? d.toISOString().slice(0, 13) : d.toISOString().slice(0, 10);

    const now = new Date();
    for (let i = bucketCount - 1; i >= 0; i--) {
      const d = new Date(now);
      if (period === "daily") d.setUTCHours(d.getUTCHours() - i, 0, 0, 0);
      else d.setUTCDate(d.getUTCDate() - i);
      byKey.set(keyOf(d), { completed: 0, skipped: 0, missed: 0 });
    }

    for (const r of rows) {
      const key = keyOf(r.bucket);
      const slot = byKey.get(key);
      if (!slot) continue; // aralık dışında kalan kenar kaydı
      const n = Number(r.count);
      if (r.status === "COMPLETED") slot.completed += n;
      else if (r.status === "SKIPPED") slot.skipped += n;
      else if (r.status === "MISSED") slot.missed += n;
    }

    const bucketList: EyeStrainBucket[] = [...byKey.entries()].map(([key, c]) => ({
      key,
      ...c,
      complianceRate: complianceRate(c),
    }));

    const totals = bucketList.reduce(
      (acc, b) => ({
        completed: acc.completed + b.completed,
        skipped: acc.skipped + b.skipped,
        missed: acc.missed + b.missed,
      }),
      { completed: 0, skipped: 0, missed: 0 }
    );

    return {
      period,
      from: bucketList[0]?.key ?? "",
      to: bucketList[bucketList.length - 1]?.key ?? "",
      totals: {
        triggered: totals.completed + totals.skipped + totals.missed,
        ...totals,
        complianceRate: complianceRate(totals),
      },
      buckets: bucketList,
    };
  });
}
