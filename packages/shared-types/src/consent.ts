import { z } from "zod";

// docs/02-VERI-MODELI-VE-GUVENLIK.md — KVKK rıza kayıtları
export const consentTypeSchema = z.enum([
  "AYDINLATMA_METNI",
  "OZEL_NITELIKLI_VERI_RIZASI",
  "BILDIRIM_IZNI_GOZ",
  "BILDIRIM_IZNI_OGUN",
  "BILDIRIM_IZNI_KAN_TAHLILI",
  "BILDIRIM_IZNI_POSTUR",
  "BILDIRIM_IZNI_SU",
  "BILDIRIM_IZNI_STRES",
]);
export type ConsentType = z.infer<typeof consentTypeSchema>;

/**
 * Yürürlükteki metin sürümleri. Bir metin değişirse buradaki sürüm artırılır;
 * kullanıcı eski sürüme onay vermişse yeniden onay istenir (KVKK md. 6).
 *
 * Sürümü artırmak, o metne bağlı tüm kullanıcıları yeniden onay akışına
 * sokar — metinde anlamlı bir değişiklik yoksa artırma.
 */
export const CURRENT_CONSENT_VERSIONS = {
  AYDINLATMA_METNI: "aydinlatma-v1",
  OZEL_NITELIKLI_VERI_RIZASI: "acik-riza-v1",
} as const satisfies Partial<Record<ConsentType, string>>;

/**
 * Uygulamayı kullanmaya başlamak için zorunlu olan rızalar. Bildirim izinleri
 * (BILDIRIM_IZNI_*) buraya girmez — onlar opsiyonel ve sonradan verilebilir.
 */
export const REQUIRED_CONSENT_TYPES = [
  "AYDINLATMA_METNI",
  "OZEL_NITELIKLI_VERI_RIZASI",
] as const satisfies readonly ConsentType[];

export type RequiredConsentType = (typeof REQUIRED_CONSENT_TYPES)[number];

export const grantConsentSchema = z.object({
  consentType: consentTypeSchema,
  textVersion: z.string().min(1).max(64), // örn. "aydinlatma-v1"
});
export type GrantConsentInput = z.infer<typeof grantConsentSchema>;

export const revokeConsentSchema = z.object({
  consentType: consentTypeSchema,
});
export type RevokeConsentInput = z.infer<typeof revokeConsentSchema>;

export const consentRecordSchema = z.object({
  id: z.string(),
  consentType: consentTypeSchema,
  textVersion: z.string(),
  grantedAt: z.string(),
  revokedAt: z.string().nullable(),
});
export type ConsentRecordDto = z.infer<typeof consentRecordSchema>;

/**
 * Onboarding kapısının cevabı: hangi zorunlu rızalar hâlâ eksik?
 * Boş dizi = kullanıcı uygulamaya girebilir.
 */
export const consentStatusSchema = z.object({
  missing: z.array(
    z.object({
      consentType: consentTypeSchema,
      requiredVersion: z.string(),
      /** Daha eski bir sürüme onay verilmişse o sürüm; hiç verilmemişse null. */
      grantedVersion: z.string().nullable(),
    })
  ),
  records: z.array(consentRecordSchema),
});
export type ConsentStatus = z.infer<typeof consentStatusSchema>;
