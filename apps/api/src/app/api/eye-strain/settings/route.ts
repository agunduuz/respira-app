import { prisma } from "@respira/database";
import {
  EYE_STRAIN_DEFAULTS,
  eyeStrainSettingsSchema,
  type EyeStrainSettingsInput,
} from "@respira/shared-types";

import { handle, parseBody } from "@/lib/http";
import { consume } from "@/lib/rate-limit";
import { requireDbUser } from "@/lib/user";

export const dynamic = "force-dynamic";

/** Ayar satırı yoksa varsayılanlarla oluşturulur — istemci hep bir değer alır. */
export function GET(request: Request) {
  return handle<EyeStrainSettingsInput>(async () => {
    const user = await requireDbUser(request);

    const settings = await prisma.eyeStrainSettings.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...EYE_STRAIN_DEFAULTS },
      update: {},
    });

    return {
      intervalMinutes: settings.intervalMinutes,
      breakSeconds: settings.breakSeconds,
    };
  });
}

export function PUT(request: Request) {
  return handle<EyeStrainSettingsInput>(async () => {
    const user = await requireDbUser(request);
    consume(`eye-settings:${user.id}`, { limit: 60, windowMs: 60_000 });

    const input = await parseBody(request, eyeStrainSettingsSchema);

    const settings = await prisma.eyeStrainSettings.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...input },
      update: input,
    });

    return {
      intervalMinutes: settings.intervalMinutes,
      breakSeconds: settings.breakSeconds,
    };
  });
}
