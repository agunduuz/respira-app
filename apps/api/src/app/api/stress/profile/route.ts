import { prisma } from "@respira/database";
import { stressProfileSchema } from "@respira/shared-types";

import { handle, parseBody } from "@/lib/http";
import { consume } from "@/lib/rate-limit";
import { requireDbUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handle(async () => {
    const user = await requireDbUser(request);
    const profile = await prisma.stressProfile.findUnique({ where: { userId: user.id } });
    // Profil yoksa null — istemci sıklık sorusunu gösteriyor.
    return { profile };
  });
}

export function PUT(request: Request) {
  return handle(async () => {
    const user = await requireDbUser(request);
    consume(`stress-profile:${user.id}`, { limit: 30, windowMs: 60_000 });

    const input = await parseBody(request, stressProfileSchema);

    const data = { desiredSessionsPerDay: input.desiredSessionsPerDay };

    const profile = await prisma.stressProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });

    return { profile };
  });
}
