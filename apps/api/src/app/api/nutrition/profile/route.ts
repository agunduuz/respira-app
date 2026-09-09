import { prisma } from "@respira/database";
import { calculateMacroTargets, nutritionProfileSchema } from "@respira/shared-types";

import { HttpError, handle, parseBody } from "@/lib/http";
import { toDateOnly } from "@/lib/nutrition";
import { consume } from "@/lib/rate-limit";
import { requireDbUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handle(async () => {
    const user = await requireDbUser(request);
    const profile = await prisma.nutritionProfile.findUnique({ where: { userId: user.id } });
    // Profil yoksa 404 değil null: istemci "anket tamamlanmamış" durumunu
    // hata olarak değil, akışın normal bir hâli olarak ele alıyor.
    return { profile };
  });
}

/** 5 adımlı anketin sonucu. Adım 5'teki "Başla" bunu gönderiyor. */
export function PUT(request: Request) {
  return handle(async () => {
    const user = await requireDbUser(request);
    consume(`nutrition-profile:${user.id}`, { limit: 30, windowMs: 60_000 });

    const input = await parseBody(request, nutritionProfileSchema);

    // Kullanıcı makroları elle değiştirmediyse, kaydedilen değerlerin gerçekten
    // Adım 1-2 verilerinden türediğini sunucuda da doğruluyoruz. İstemciye
    // güvenip keyfi hedef yazılmasını istemiyoruz.
    if (!input.macrosCustomized) {
      const computed = calculateMacroTargets({
        age: input.age,
        heightCm: input.heightCm,
        weightKg: input.weightKg,
        biologicalSex: input.biologicalSex ?? null,
        trainingFrequency: input.trainingFrequency,
        bodyGoal: input.bodyGoal,
      });
      const drift = Math.abs(computed.targetCalories - input.targetCalories);
      if (drift > 5) {
        throw new HttpError(
          409,
          "Makro hedefleri profil verisiyle uyuşmuyor. Elle değiştirdiysen macrosCustomized alanını true gönder.",
          "MACROS_MISMATCH"
        );
      }
    }

    const data = {
      mealsPerDay: input.mealsPerDay,
      mealTimes: input.mealTimes ?? undefined,
      age: input.age,
      heightCm: input.heightCm,
      weightKg: input.weightKg,
      biologicalSex: input.biologicalSex ?? null,
      trainingFrequency: input.trainingFrequency,
      trainingType: input.trainingType,
      bodyGoal: input.bodyGoal,
      bodyFatPercent: input.bodyFatPercent ?? null,
      measurements: input.measurements ?? undefined,
      targetCalories: input.targetCalories,
      targetProteinG: input.targetProteinG,
      targetCarbsG: input.targetCarbsG,
      targetFatG: input.targetFatG,
      macrosCustomized: input.macrosCustomized,
      bloodType: input.bloodType ?? null,
      sugarNeedRate: input.sugarNeedRate ?? null,
      lastBloodTestDate: input.lastBloodTestDate ? toDateOnly(input.lastBloodTestDate) : null,
      bloodTestReminderMonths: input.bloodTestReminderMonths ?? null,
    };

    const profile = await prisma.nutritionProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });

    return { profile };
  });
}
