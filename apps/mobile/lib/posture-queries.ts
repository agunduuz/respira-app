import type {
  BreakStatus,
  Exercise,
  FyiMessage,
  PostureProfileInput,
} from "@respira/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "./api";

export interface StoredPostureProfile extends PostureProfileInput {
  id: string;
}

export interface PostureSession {
  set: { id: string; exercises: Exercise[]; totalSeconds: number };
  fyi: FyiMessage | null;
  quietHours: { start: string; end: string } | null;
  minutesPerHourAvailable: number;
}

export const postureKeys = {
  profile: ["posture", "profile"] as const,
  session: ["posture", "session"] as const,
  breaks: ["posture", "breaks"] as const,
};

export function usePostureProfile() {
  return useQuery({
    queryKey: postureKeys.profile,
    queryFn: () => apiFetch<{ profile: StoredPostureProfile | null }>("/api/posture/profile"),
  });
}

export function useSavePostureProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PostureProfileInput) =>
      apiFetch<{ profile: StoredPostureProfile }>("/api/posture/profile", {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posture"] }),
  });
}

export function usePostureSession(enabled: boolean) {
  return useQuery({
    queryKey: postureKeys.session,
    queryFn: () => apiFetch<PostureSession>("/api/posture/session"),
    enabled,
  });
}

export function useTodayBreaks(enabled: boolean) {
  return useQuery({
    queryKey: postureKeys.breaks,
    queryFn: () =>
      apiFetch<{ today: Record<BreakStatus, number> }>("/api/posture/breaks"),
    enabled,
  });
}

export function useRecordBreak() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { status: BreakStatus; triggeredAt: string; exerciseSetId?: string | null }) =>
      apiFetch<{ recorded: number }>("/api/posture/breaks", {
        method: "POST",
        body: JSON.stringify({ breaks: [v] }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posture"] }),
  });
}
