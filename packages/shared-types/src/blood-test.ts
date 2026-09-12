import { z } from "zod";

import { dateKeySchema } from "./daily-report.ts";

/**
 * docs/04 Adım 4 — kan tahlili hatırlatması.
 *
 * Bu bir takvim hatırlatmasıdır; tıbbi bir öneri değildir. Hatırlatma
 * açılmadan önce kullanıcıya yasal uyarı gösterilip
 * ConsentType.BILDIRIM_IZNI_KAN_TAHLILI olarak onaylatılır.
 */

/** docs/04'te sunulan hazır seçenekler; "özel" için serbest ay sayısı. */
export const BLOOD_TEST_INTERVAL_PRESETS = [3, 6, 12] as const;

export const bloodTestReminderSchema = z.object({
  /** Son tahlil tarihi bilinmiyorsa null — hatırlatma bugünden sayılır. */
  lastBloodTestDate: dateKeySchema.nullable().optional(),
  /** null = hatırlatma kapalı. */
  reminderMonths: z.number().int().min(1).max(60).nullable(),
});
export type BloodTestReminderInput = z.infer<typeof bloodTestReminderSchema>;

/**
 * Hatırlatmanın düşeceği tarihi hesaplar.
 *
 * Son tahlil tarihi biliniyorsa onun üzerine eklenir; bilinmiyorsa bugünden
 * sayılır. Sonuç geçmişte kalıyorsa (ör. son tahlil 2 yıl önce, aralık 6 ay)
 * hatırlatma hemen tetiklenmesin diye bugüne ötelenir — geçmişe bildirim
 * kurulamaz ve kullanıcıyı açılışta uyarıyla karşılamak istemiyoruz.
 */
export function nextBloodTestDate(params: {
  lastBloodTestDate: Date | null;
  reminderMonths: number;
  now: Date;
}): Date {
  const { lastBloodTestDate, reminderMonths, now } = params;
  const base = lastBloodTestDate ?? now;

  const target = new Date(base);
  target.setMonth(target.getMonth() + reminderMonths);

  return target.getTime() <= now.getTime() ? new Date(now) : target;
}

/**
 * docs/04 Adım 4'te ZORUNLU olarak gösterilip onaylatılması gereken ibare.
 *
 * ⚠️ Taslak metindir. docs/04'ün Türkiye hukuku notu: bu ibarenin yeterliliği
 * App Store/Play Store sağlık uygulaması politikaları ve KVKK özel nitelikli
 * veri şartları açısından yayın öncesi hukuk danışmanına onaylatılmalı.
 */
export const BLOOD_TEST_LEGAL_NOTICE =
  "Bu uygulama bir sağlık hizmeti sunmaz, tanı veya tedavi önermez. Kan tahlili hatırlatması yalnızca bir takvim hatırlatma aracıdır, tıbbi bir öneri değildir.";
