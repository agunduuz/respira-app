import { prisma } from "@respira/database";
import { recordBreathingSessionSchema } from "@respira/shared-types";

import { HttpError, handle, parseBody } from "@/lib/http";
import { consume } from "@/lib/rate-limit";
import { requireDbUser } from "@/lib/user";

export const dynamic = "force-dynamic";

const MAX_FUTURE_SKEW_MS = 5 * 60_000;

/** Bugünün seans özeti — ana ekrandaki sayaç için (docs/07 kabul kriteri: sıklık takibi). */
export function GET(request: Request) {
  return handle(async () => {
    const user = await requireDbUser(request);

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const logs = await prisma.breathingSession.groupBy({
      by: ["status"],
      where: { userId: user.id, triggeredAt: { gte: start } },
      _count: { _all: true },
    });

    const counts = { COMPLETED: 0, SKIPPED: 0, MISSED: 0 };
    for (const l of logs) counts[l.status] = l._count._all;

    return { today: counts };
  });
}

export function POST(request: Request) {
  return handle(async () => {
    const user = await requireDbUser(request);
    consume(`stress-sessions:${user.id}`, { limit: 60, windowMs: 60_000 });

    const input = await parseBody(request, recordBreathingSessionSchema);

    const triggeredAt = new Date(input.triggeredAt);
    if (triggeredAt.getTime() > Date.now() + MAX_FUTURE_SKEW_MS) {
      throw new HttpError(400, "Gelecek tarihli seans kaydedilemez", "FUTURE_TIMESTAMP");
    }

    // (userId, triggeredAt) tekil — ağ tekrarı aynı seansı iki kez yazmasın
    // (posture_break_logs ile aynı desen).
    const result = await prisma.breathingSession.createMany({
      data: [
        {
          userId: user.id,
          stressLevel: input.stressLevel ?? null,
          technique: input.technique,
          durationSeconds: input.durationSeconds,
          status: input.status,
          triggeredAt,
        },
      ],
      skipDuplicates: true,
    });

    return { recorded: result.count };
  });
}
