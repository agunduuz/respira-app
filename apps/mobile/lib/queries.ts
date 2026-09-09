import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import type {
  ConsentStatus,
  ConsentType,
  GrantConsentInput,
  UserProfile,
} from "@respira/shared-types";

import { apiFetch } from "./api";

export const queryKeys = {
  profile: ["profile"] as const,
  consents: ["consents"] as const,
};

/** Oturum açıldıktan sonra yerel User satırını oluşturur/döner. */
export function useBootstrap(enabled: boolean): UseQueryResult<UserProfile> {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => apiFetch<UserProfile>("/api/users/bootstrap", { method: "POST" }),
    enabled,
    staleTime: Infinity,
  });
}

/** Onboarding kapısı: eksik zorunlu rızalar. */
export function useConsentStatus(enabled: boolean): UseQueryResult<ConsentStatus> {
  return useQuery({
    queryKey: queryKeys.consents,
    queryFn: () => apiFetch<ConsentStatus>("/api/consents"),
    enabled,
  });
}

export function useGrantConsent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GrantConsentInput) =>
      apiFetch("/api/consents", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.consents }),
  });
}

export function useRevokeConsent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (consentType: ConsentType) =>
      apiFetch("/api/consents", { method: "DELETE", body: JSON.stringify({ consentType }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.consents }),
  });
}

/** KVKK md. 11 — verilerin dışa aktarılması. */
export function useExportData() {
  return useMutation({
    mutationFn: () => apiFetch<Record<string, unknown>>("/api/me/export"),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: (confirmation: string) =>
      apiFetch("/api/me", { method: "DELETE", body: JSON.stringify({ confirmation }) }),
  });
}
