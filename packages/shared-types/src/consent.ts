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

export const grantConsentSchema = z.object({
  consentType: consentTypeSchema,
  textVersion: z.string().min(1), // örn. "aydinlatma-v1.2"
});
export type GrantConsentInput = z.infer<typeof grantConsentSchema>;
