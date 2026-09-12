import type {
  MealEntryInput,
  NutritionPeriod,
  NutritionProfileInput,
} from "@respira/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "./api";

export interface StoredProfile extends NutritionProfileInput {
  id: string;
  userId: string;
}

export interface MealRow {
  id: string;
  date: string;
  mealLabel: string;
  mode: "SIMPLE" | "DETAILED";
  rawText: string | null;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  fiberG: number | null;
  isFavorite: boolean;
  createdAt: string;
}

export interface DaySummary {
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG: number;
}

export const nutritionKeys = {
  profile: ["nutrition", "profile"] as const,
  day: (date: string) => ["nutrition", "day", date] as const,
  suggestion: (date: string, meal: string) => ["nutrition", "suggestion", date, meal] as const,
  report: (period: NutritionPeriod) => ["nutrition", "report", period] as const,
};

export function useNutritionProfile() {
  return useQuery({
    queryKey: nutritionKeys.profile,
    queryFn: () => apiFetch<{ profile: StoredProfile | null }>("/api/nutrition/profile"),
  });
}

export function useSaveNutritionProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NutritionProfileInput) =>
      apiFetch<{ profile: StoredProfile }>("/api/nutrition/profile", {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nutrition"] }),
  });
}

export function useDayMeals(date: string) {
  return useQuery({
    queryKey: nutritionKeys.day(date),
    queryFn: () =>
      apiFetch<{ date: string; meals: MealRow[]; summary: DaySummary | null }>(
        `/api/nutrition/meals?date=${date}`
      ),
  });
}

export function useAddMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MealEntryInput) =>
      apiFetch<{ meal: MealRow }>("/api/nutrition/meals", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nutrition"] }),
  });
}

export function useToggleMealFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; isFavorite: boolean }) =>
      apiFetch<{ meal: MealRow }>(`/api/nutrition/meals/${v.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isFavorite: v.isFavorite }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nutrition"] }),
  });
}

export function useDeleteMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ deleted: true }>(`/api/nutrition/meals/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nutrition"] }),
  });
}

export interface SuggestionResponse {
  suggestion: {
    basis: "numeric" | "general";
    message: string;
    gaps?: { calories: number; proteinG: number; carbsG: number; fatG: number };
    disclaimer: string;
  };
  previousDayReference: string | null;
}

export function useMealSuggestion(date: string, mealLabel: string, enabled: boolean) {
  return useQuery({
    queryKey: nutritionKeys.suggestion(date, mealLabel),
    queryFn: () =>
      apiFetch<SuggestionResponse>(
        `/api/nutrition/suggestion?date=${date}&mealLabel=${encodeURIComponent(mealLabel)}`
      ),
    enabled,
  });
}

export interface NutritionReport {
  period: NutritionPeriod;
  from: string;
  to: string;
  targets: { calories: number; proteinG: number; carbsG: number; fatG: number };
  averages: {
    calories: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
    fiberG: number | null;
  };
  vsTarget: {
    calories: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
  };
  daysWithData: number;
  buckets: {
    key: string;
    hasData: boolean;
    calories: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
    fiberG: number | null;
  }[];
}

export function useNutritionReport(period: NutritionPeriod) {
  return useQuery({
    queryKey: nutritionKeys.report(period),
    queryFn: () => apiFetch<NutritionReport>(`/api/nutrition/reports?period=${period}`),
  });
}
