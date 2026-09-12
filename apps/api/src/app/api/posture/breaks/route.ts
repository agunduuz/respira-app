import { prisma } from "@respira/database";
import { recordPostureBreaksSchema } from "@respira/shared-types";

import { HttpError, handle, parseBody } from "@/lib/http";
import { consume } from "@/lib/rate-limit";
import { requireDbUser } from "@/lib/user";

export const dynamic = "force-dynamic";

const MAX_FUTURE_SKEW_MS = 5 * 60_000;

/** Bugünün mola özeti — sayaç ekranındaki ilerleme için. */
export function GET(request: Request) {
  return handle(async () => {
    const user = await requireDbUser(request);

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const logs = await prisma.postureBreakLog.groupBy({
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
  return handle<{ recorded: number }>(async () => {
    const user = await requireDbUser(request);
    consume(`posture-breaks:${user.id}`, { limit: 60, windowMs: 60_000 });

    const { breaks } = await parseBody(request, recordPostureBreaksSchema);

    const now = Date.now();
    const rows = breaks.map((b) => {
      const triggeredAt = new Date(b.triggeredAt);
      if (triggeredAt.getTime() > now + MAX_FUTURE_SKEW_MS) {
        throw new HttpError(400, "Gelecek tarihli mola kaydedilemez", "FUTURE_TIMESTAMP");
      }
      return {
        userId: user.id,
        status: b.status,
        triggeredAt,
        exerciseSetId: b.exerciseSetId ?? null,
      };
    });

    // (userId, triggeredAt) tekil — ağ tekrarı kaydı ikiye katlamıyor.
    const result = await prisma.postureBreakLog.createMany({ data: rows, skipDuplicates: true });
    return { recorded: result.count };
  });
}
