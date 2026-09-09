import {
  EYE_STRAIN_DEFAULTS,
  type EyeStrainAnalytics,
  type EyeStrainPeriod,
  type EyeStrainSettingsInput,
  type RecordEyeStrainSessionInput,
} from "@respira/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "./api";

export const eyeStrainKeys = {
  settings: ["eye-strain", "settings"] as const,
  analytics: (period: EyeStrainPeriod) => ["eye-strain", "analytics", period] as const,
};

export function useEyeStrainSettings() {
  return useQuery({
    queryKey: eyeStrainKeys.settings,
    queryFn: () => apiFetch<EyeStrainSettingsInput>("/api/eye-strain/settings"),
    // Ayarlar sunucudan gelene kadar sayaç varsayılanlarla çalışabilsin.
    placeholderData: EYE_STRAIN_DEFAULTS,
  });
}

export function useUpdateEyeStrainSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: EyeStrainSettingsInput) =>
      apiFetch<EyeStrainSettingsInput>("/api/eye-strain/settings", {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => qc.setQueryData(eyeStrainKeys.settings, data),
  });
}

export function useRecordSessions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessions: RecordEyeStrainSessionInput[]) =>
      apiFetch<{ recorded: number }>("/api/eye-strain/sessions", {
        method: "POST",
        body: JSON.stringify({ sessions }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["eye-strain", "analytics"] }),
  });
}

export function useEyeStrainAnalytics(period: EyeStrainPeriod) {
  // Gün sınırları kullanıcının yerel saatine göre kesilmeli (docs/03 analiz).
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  return useQuery({
    queryKey: eyeStrainKeys.analytics(period),
    queryFn: () =>
      apiFetch<EyeStrainAnalytics>(
        `/api/eye-strain/analytics?period=${period}&tz=${encodeURIComponent(tz)}`
      ),
  });
}
