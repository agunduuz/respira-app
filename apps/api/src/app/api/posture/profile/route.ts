import { prisma } from "@respira/database";
import { postureProfileSchema } from "@respira/shared-types";

import { handle, parseBody } from "@/lib/http";
import { consume } from "@/lib/rate-limit";
import { requireDbUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handle(async () => {
    const user = await requireDbUser(request);
    const profile = await prisma.postureProfile.findUnique({ where: { userId: user.id } });
    // Profil yoksa null — istemci onboarding formunu gösteriyor.
    return { profile };
  });
}

export function PUT(request: Request) {
  return handle(async () => {
    const user = await requireDbUser(request);
    consume(`posture-profile:${user.id}`, { limit: 30, windowMs: 60_000 });

    const input = await parseBody(request, postureProfileSchema);

    const data = {
      workStyle: input.workStyle,
      workIntensity: input.workIntensity,
      screenHoursPerDay: input.screenHoursPerDay ?? null,
      occupationType: input.occupationType,
      minutesPerHourAvailable: input.minutesPerHourAvailable,
      workHoursStart: input.workHoursStart ?? null,
      workHoursEnd: input.workHoursEnd ?? null,
    };

    const profile = await prisma.postureProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });

    return { profile };
  });
}
