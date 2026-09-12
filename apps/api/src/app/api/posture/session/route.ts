import { prisma } from "@respira/database";
import {
  buildExerciseSet,
  rotateFyi,
  workHoursToQuietHours,
  type ExerciseSet,
  type FyiMessage,
} from "@respira/shared-types";

import { HttpError, handle } from "@/lib/http";
import { requireDbUser } from "@/lib/user";

export const dynamic = "force-dynamic";

/**
 * Bir mola için egzersiz seti + rotasyonlu FYI notu.
 *
 * Rotasyon sunucuda hesaplanıyor: o güne kadar kaydedilmiş mola sayısı
 * kullanılıyor. Böylece istemci durum tutmak zorunda kalmıyor ve cihaz
 * değişse bile kullanıcı aynı hareketleri arka arkaya görmüyor.
 */
export function GET(request: Request) {
  return handle<{
    set: ExerciseSet;
    fyi: FyiMessage | null;
    quietHours: { start: string; end: string } | null;
    minutesPerHourAvailable: number;
  }>(async () => {
    const user = await requireDbUser(request);

    const profile = await prisma.postureProfile.findUnique({ where: { userId: user.id } });
    if (!profile) {
      throw new HttpError(409, "Önce postür formunu doldurman gerekiyor", "NO_PROFILE");
    }

    const rotation = await prisma.postureBreakLog.count({ where: { userId: user.id } });

    const set = buildExerciseSet({
      workStyle: profile.workStyle,
      minutesPerHourAvailable: profile.minutesPerHourAvailable,
      rotation,
    });

    const fyi = rotateFyi(
      {
        workStyle: profile.workStyle,
        workIntensity: profile.workIntensity,
        hasScreenWork: (profile.screenHoursPerDay ?? 0) > 0,
      },
      rotation
    );

    return {
      set,
      fyi,
      // İstemci bildirim planını bu pencereyi atlayarak kuruyor —
      // yani bildirimler yalnızca mesai içinde düşüyor (docs/05).
      quietHours: workHoursToQuietHours(profile.workHoursStart, profile.workHoursEnd),
      minutesPerHourAvailable: profile.minutesPerHourAvailable,
    };
  });
}
