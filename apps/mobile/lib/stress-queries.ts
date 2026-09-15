import type { RecordBreathingSessionInput, StressProfileInput } from "@respira/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "./api";

export interface StoredStressProfile extends StressProfileInput {
  id: string;
}

export type SessionStatus = "COMPLETED" | "SKIPPED" | "MISSED";

export const stressKeys = {
  profile: ["stress", "profile"] as const,
  sessions: ["stress", "sessions"] as const,
};

export function useStressProfile() {
  return useQuery({
    queryKey: stressKeys.profile,
    queryFn: () => apiFetch<{ profile: StoredStressProfile | null }>("/api/stress/profile"),
  });
}

export function useSaveStressProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StressProfileInput) =>
      apiFetch<{ profile: StoredStressProfile }>("/api/stress/profile", {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stress"] }),
  });
}

export function useTodaySessions(enabled: boolean) {
  return useQuery({
    queryKey: stressKeys.sessions,
    queryFn: () =>
      apiFetch<{ today: Record<SessionStatus, number> }>("/api/stress/sessions"),
    enabled,
  });
}

export function useRecordSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RecordBreathingSessionInput) =>
      apiFetch<{ recorded: number }>("/api/stress/sessions", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: stressKeys.sessions }),
  });
}
