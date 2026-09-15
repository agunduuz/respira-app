import { prisma } from "@respira/database";
import { logWaterIntakeSchema } from "@respira/shared-types";

import { HttpError, handle, parseBody } from "@/lib/http";
import { consume } from "@/lib/rate-limit";
import { requireDbUser } from "@/lib/user";

export const dynamic = "force-dynamic";

const MAX_FUTURE_SKEW_MS = 5 * 60_000;

/** Bugünün girişleri ve toplamı — ana ekrandaki animasyon ve referans çizgisi için. */
export function GET(request: Request) {
  return handle(async () => {
    const user = await requireDbUser(request);

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const logs = await prisma.waterIntakeLog.findMany({
      where: { userId: user.id, loggedAt: { gte: start } },
      orderBy: { loggedAt: "desc" },
    });

    const totalMl = logs.reduce((sum, l) => sum + l.amountMl, 0);
    return { logs, totalMl };
  });
}

export function POST(request: Request) {
  return handle(async () => {
    const user = await requireDbUser(request);
    consume(`water-intake:${user.id}`, { limit: 60, windowMs: 60_000 });

    const input = await parseBody(request, logWaterIntakeSchema);

    const loggedAt = input.loggedAt ? new Date(input.loggedAt) : new Date();
    if (loggedAt.getTime() > Date.now() + MAX_FUTURE_SKEW_MS) {
      throw new HttpError(400, "Gelecek tarihli su girişi kaydedilemez", "FUTURE_TIMESTAMP");
    }

    const log = await prisma.waterIntakeLog.create({
      data: { userId: user.id, amountMl: input.amountMl, loggedAt },
    });

    return { log };
  });
}
