import { prisma } from "@respira/database";
import {
  BLOOD_TEST_LEGAL_NOTICE,
  CURRENT_CONSENT_VERSIONS,
  bloodTestReminderSchema,
  nextBloodTestDate,
} from "@respira/shared-types";

import { HttpError, handle, parseBody } from "@/lib/http";
import { toDateOnly } from "@/lib/nutrition";
import { consume } from "@/lib/rate-limit";
import { requireDbUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handle(async () => {
    const user = await requireDbUser(request);
    const profile = await prisma.nutritionProfile.findUnique({
      where: { userId: user.id },
      select: { lastBloodTestDate: true, bloodTestReminderMonths: true },
    });

    return {
      lastBloodTestDate: profile?.lastBloodTestDate?.toISOString().slice(0, 10) ?? null,
      reminderMonths: profile?.bloodTestReminderMonths ?? null,
      legalNotice: BLOOD_TEST_LEGAL_NOTICE,
      requiredConsentVersion: CURRENT_CONSENT_VERSIONS.BILDIRIM_IZNI_KAN_TAHLILI,
    };
  });
}

/**
 * docs/04 Adım 4 — kan tahlili hatırlatması.
 *
 * Hatırlatma AÇILIRKEN, yasal uyarının onaylandığına dair geçerli bir rıza
 * kaydı aranıyor. İstemci ekranda ibareyi göstermeyi atlarsa bile sunucu
 * hatırlatmayı kurmuyor — uyarının gösterildiğinin tek kanıtı bu kayıt.
 *
 * Kapatmak (reminderMonths: null) için rıza gerekmiyor; kullanıcıyı bir
 * özelliği kapatmak için onay vermeye zorlamak anlamsız olurdu.
 */
export function PUT(request: Request) {
  return handle(async () => {
    const user = await requireDbUser(request);
    consume(`blood-test:${user.id}`, { limit: 30, windowMs: 60_000 });

    const input = await parseBody(request, bloodTestReminderSchema);

    if (input.reminderMonths !== null) {
      const consent = await prisma.consentRecord.findFirst({
        where: {
          userId: user.id,
          consentType: "BILDIRIM_IZNI_KAN_TAHLILI",
          revokedAt: null,
          textVersion: CURRENT_CONSENT_VERSIONS.BILDIRIM_IZNI_KAN_TAHLILI,
        },
      });

      if (!consent) {
        throw new HttpError(
          409,
          "Kan tahlili hatırlatması için önce yasal uyarının onaylanması gerekiyor.",
          "CONSENT_REQUIRED"
        );
      }
    }

    const profile = await prisma.nutritionProfile.findUnique({ where: { userId: user.id } });
    if (!profile) {
      throw new HttpError(409, "Önce beslenme anketini tamamlaman gerekiyor", "NO_PROFILE");
    }

    const lastDate = input.lastBloodTestDate ? toDateOnly(input.lastBloodTestDate) : null;

    const updated = await prisma.nutritionProfile.update({
      where: { userId: user.id },
      data: {
        lastBloodTestDate: lastDate,
        bloodTestReminderMonths: input.reminderMonths,
      },
      select: { lastBloodTestDate: true, bloodTestReminderMonths: true },
    });

    // Bildirim planını istemci kuruyor (local notification); sunucu yalnızca
    // hangi tarihe kurulacağını söylüyor ki iki taraf aynı hesabı yapsın.
    const scheduledFor =
      input.reminderMonths === null
        ? null
        : nextBloodTestDate({
            lastBloodTestDate: lastDate,
            reminderMonths: input.reminderMonths,
            now: new Date(),
          }).toISOString();

    return {
      lastBloodTestDate: updated.lastBloodTestDate?.toISOString().slice(0, 10) ?? null,
      reminderMonths: updated.bloodTestReminderMonths,
      scheduledFor,
    };
  });
}
