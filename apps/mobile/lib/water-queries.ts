import type { LogWaterIntakeInput, WaterGoalInput } from "@respira/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "./api";

export interface StoredWaterGoal extends WaterGoalInput {
  id: string;
}

export interface WaterIntakeLogRow {
  id: string;
  amountMl: number;
  loggedAt: string;
}

export const waterKeys = {
  goal: ["water", "goal"] as const,
  intake: ["water", "intake"] as const,
};

export function useWaterGoal() {
  return useQuery({
    queryKey: waterKeys.goal,
    queryFn: () => apiFetch<{ goal: StoredWaterGoal | null }>("/api/water/goal"),
  });
}

export function useSaveWaterGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WaterGoalInput) =>
      apiFetch<{ goal: StoredWaterGoal }>("/api/water/goal", {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["water"] }),
  });
}

export function useTodayIntake(enabled: boolean) {
  return useQuery({
    queryKey: waterKeys.intake,
    queryFn: () =>
      apiFetch<{ logs: WaterIntakeLogRow[]; totalMl: number }>("/api/water/intake"),
    enabled,
  });
}

export function useLogIntake() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LogWaterIntakeInput) =>
      apiFetch<{ log: WaterIntakeLogRow }>("/api/water/intake", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: waterKeys.intake }),
  });
}
