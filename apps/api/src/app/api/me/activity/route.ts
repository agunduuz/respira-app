import { prisma } from "@respira/database";
import {
  activityMonthSchema,
  timeZoneSchema,
  type ActivityDay,
  type ActivityMonth,
} from "@respira/shared-types";

import { handle } from "@/lib/http";
import { requireDbUser } from "@/lib/user";

export const dynamic = "force-dynamic";

type DayCount = { day: string; value: number };

/**
 * Profil takviminin tek veri kaynağı: bir aydaki günlük aktivite.
 *
 * Gün sınırları kullanıcının yerel saat dilimine göre kesiliyor (analytics
 * ucundaki kalıbın aynısı) — aksi hâlde gece geç saatteki bir kayıt ertesi
 * güne düşerdi. `tz` kullanıcıdan geliyor ama parametre olarak bağlanıyor;
 * geçersiz bir değerde Postgres hata verir, sessizce UTC'ye düşmez.
 */
export function GET(request: Request) {
  return handle<ActivityMonth>(async () => {
    const user = await requireDbUser(request);

    const url = new URL(request.url);
    const month = activityMonthSchema.parse(
      url.searchParams.get("month") ?? new Date().toISOString().slice(0, 7)
    );
    const tz = timeZoneSchema.parse(url.searchParams.get("tz") ?? "UTC");
    const monthStart = `${month}-01`;

    const [eye, water, posture, breathing, meals, goal] = await Promise.all([
      prisma.$queryRaw<DayCount[]>`
        SELECT to_char(date_trunc('day', "triggeredAt" AT TIME ZONE ${tz}), 'YYYY-MM-DD') AS day,
               count(*)::int AS value
        FROM "eye_strain_sessions"
        WHERE "userId" = ${user.id} AND "status" = 'COMPLETED'
          AND date_trunc('month', "triggeredAt" AT TIME ZONE ${tz}) = ${monthStart}::date
        GROUP BY 1
      `,
      prisma.$queryRaw<DayCount[]>`
        SELECT to_char(date_trunc('day', "loggedAt" AT TIME ZONE ${tz}), 'YYYY-MM-DD') AS day,
               coalesce(sum("amountMl"), 0)::int AS value
        FROM "water_intake_logs"
        WHERE "userId" = ${user.id}
          AND date_trunc('month', "loggedAt" AT TIME ZONE ${tz}) = ${monthStart}::date
        GROUP BY 1
      `,
      prisma.$queryRaw<DayCount[]>`
        SELECT to_char(date_trunc('day', "triggeredAt" AT TIME ZONE ${tz}), 'YYYY-MM-DD') AS day,
               count(*)::int AS value
        FROM "posture_break_logs"
        WHERE "userId" = ${user.id} AND "status" = 'COMPLETED'
          AND date_trunc('month', "triggeredAt" AT TIME ZONE ${tz}) = ${monthStart}::date
        GROUP BY 1
      `,
      prisma.$queryRaw<DayCount[]>`
        SELECT to_char(date_trunc('day', "triggeredAt" AT TIME ZONE ${tz}), 'YYYY-MM-DD') AS day,
               count(*)::int AS value
        FROM "breathing_sessions"
        WHERE "userId" = ${user.id} AND "status" = 'COMPLETED'
          AND date_trunc('month', "triggeredAt" AT TIME ZONE ${tz}) = ${monthStart}::date
        GROUP BY 1
      `,
      // Öğünler zaten tarih (DATE) olarak saklanıyor — saat dilimi çevrimi gerekmez.
      prisma.$queryRaw<DayCount[]>`
        SELECT to_char("date", 'YYYY-MM-DD') AS day, count(*)::int AS value
        FROM "meal_entries"
        WHERE "userId" = ${user.id} AND to_char("date", 'YYYY-MM') = ${month}
        GROUP BY 1
      `,
      prisma.waterGoal.findUnique({ where: { userId: user.id } }),
    ]);

    const byDate = new Map<string, ActivityDay>();
    const slot = (day: string): ActivityDay => {
      const existing = byDate.get(day);
      if (existing) return existing;
      const fresh: ActivityDay = {
        date: day,
        eyeCompleted: 0,
        waterMl: 0,
        postureCompleted: 0,
        breathingCompleted: 0,
        meals: 0,
      };
      byDate.set(day, fresh);
      return fresh;
    };

    for (const r of eye) slot(r.day).eyeCompleted = r.value;
    for (const r of water) slot(r.day).waterMl = r.value;
    for (const r of posture) slot(r.day).postureCompleted = r.value;
    for (const r of breathing) slot(r.day).breathingCompleted = r.value;
    for (const r of meals) slot(r.day).meals = r.value;

    const days = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
    const waterTargetMl = goal?.dailyTargetMl ?? null;

    return {
      month,
      days,
      waterTargetMl,
      totals: {
        eyeCompleted: days.reduce((n, d) => n + d.eyeCompleted, 0),
        waterDaysOnTarget: waterTargetMl
          ? days.filter((d) => d.waterMl >= waterTargetMl).length
          : 0,
        postureCompleted: days.reduce((n, d) => n + d.postureCompleted, 0),
        breathingCompleted: days.reduce((n, d) => n + d.breathingCompleted, 0),
        activeDays: days.length,
      },
    };
  });
}
