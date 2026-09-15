import { prisma } from "@respira/database";
import { waterGoalSchema } from "@respira/shared-types";

import { handle, parseBody } from "@/lib/http";
import { consume } from "@/lib/rate-limit";
import { requireDbUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handle(async () => {
    const user = await requireDbUser(request);
    const goal = await prisma.waterGoal.findUnique({ where: { userId: user.id } });
    // Hedef yoksa null — istemci kiloya göre öneri hesaplayıp onboarding formunu gösteriyor.
    return { goal };
  });
}

export function PUT(request: Request) {
  return handle(async () => {
    const user = await requireDbUser(request);
    consume(`water-goal:${user.id}`, { limit: 30, windowMs: 60_000 });

    const input = await parseBody(request, waterGoalSchema);

    const data = {
      dailyTargetMl: input.dailyTargetMl,
      isCustomized: input.isCustomized,
      wakeTime: input.wakeTime,
      sleepTime: input.sleepTime,
    };

    const goal = await prisma.waterGoal.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });

    return { goal };
  });
}
