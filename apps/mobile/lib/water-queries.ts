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

type IntakeCache = { logs: WaterIntakeLogRow[]; totalMl: number };

/**
 * Ekle/sil, sunucu yanıtını beklemeden önbelleği hemen güncelliyor
 * (optimistic update) — invalidate + yeniden fetch turu beklenirse buton
 * tepkisi 1-2 saniye gecikmeli hissettiriyordu. Hata olursa `onError` önceki
 * durumu geri yükler; `onSettled` sunucuyla son kez senkronlar.
 */
export function useLogIntake() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LogWaterIntakeInput) =>
      apiFetch<{ log: WaterIntakeLogRow }>("/api/water/intake", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: waterKeys.intake });
      const previous = qc.getQueryData<IntakeCache>(waterKeys.intake);
      const optimisticLog: WaterIntakeLogRow = {
        id: `optimistic-${Date.now()}`,
        amountMl: input.amountMl,
        loggedAt: input.loggedAt ?? new Date().toISOString(),
      };
      qc.setQueryData<IntakeCache>(waterKeys.intake, (old) => ({
        logs: [optimisticLog, ...(old?.logs ?? [])],
        totalMl: (old?.totalMl ?? 0) + input.amountMl,
      }));
      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previous) qc.setQueryData(waterKeys.intake, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: waterKeys.intake }),
  });
}

/** Yanlışlıkla eklenen bir girişi geri almak için. */
export function useDeleteIntake() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ deleted: true }>(`/api/water/intake/${id}`, { method: "DELETE" }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: waterKeys.intake });
      const previous = qc.getQueryData<IntakeCache>(waterKeys.intake);
      qc.setQueryData<IntakeCache>(waterKeys.intake, (old) => {
        if (!old) return old;
        const removed = old.logs.find((l) => l.id === id);
        return {
          logs: old.logs.filter((l) => l.id !== id),
          totalMl: removed ? old.totalMl - removed.amountMl : old.totalMl,
        };
      });
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(waterKeys.intake, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: waterKeys.intake }),
  });
}
