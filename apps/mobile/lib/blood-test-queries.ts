import {
  CURRENT_CONSENT_VERSIONS,
  type BloodTestReminderInput,
} from "@respira/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "./api";
import { queryKeys } from "./queries";

export interface BloodTestReminderState {
  lastBloodTestDate: string | null;
  reminderMonths: number | null;
  legalNotice: string;
  requiredConsentVersion: string;
}

export const bloodTestKeys = { reminder: ["blood-test", "reminder"] as const };

export function useBloodTestReminder() {
  return useQuery({
    queryKey: bloodTestKeys.reminder,
    queryFn: () => apiFetch<BloodTestReminderState>("/api/nutrition/blood-test-reminder"),
  });
}

/**
 * docs/04 Adım 4: hatırlatma açılmadan önce yasal uyarı onaylanmalı.
 * Bu mutasyon önce rızayı kaydediyor, sonra hatırlatmayı kuruyor — sunucu da
 * rızasız isteği 409 ile reddediyor, yani sıra atlanamıyor.
 */
export function useEnableBloodTestReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: BloodTestReminderInput & { acknowledged: boolean }) => {
      if (input.reminderMonths !== null) {
        if (!input.acknowledged) {
          throw new Error("Yasal uyarı onaylanmadan hatırlatma kurulamaz");
        }
        await apiFetch("/api/consents", {
          method: "POST",
          body: JSON.stringify({
            consentType: "BILDIRIM_IZNI_KAN_TAHLILI",
            textVersion: CURRENT_CONSENT_VERSIONS.BILDIRIM_IZNI_KAN_TAHLILI,
          }),
        });
      }

      return apiFetch<{
        lastBloodTestDate: string | null;
        reminderMonths: number | null;
        scheduledFor: string | null;
      }>("/api/nutrition/blood-test-reminder", {
        method: "PUT",
        body: JSON.stringify({
          lastBloodTestDate: input.lastBloodTestDate ?? null,
          reminderMonths: input.reminderMonths,
        }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bloodTestKeys.reminder });
      qc.invalidateQueries({ queryKey: queryKeys.consents });
    },
  });
}
