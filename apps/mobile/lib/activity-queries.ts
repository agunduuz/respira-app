import type { ActivityMonth } from "@respira/shared-types";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "./api";

export const activityKeys = {
  month: (month: string) => ["activity", month] as const,
};

/** Profil takvimi: bir aydaki günlük aktivite (ay "YYYY-MM"). */
export function useMonthlyActivity(month: string) {
  // Gün sınırları kullanıcının yerel saatine göre kesilmeli (analytics ile aynı kalıp).
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  return useQuery({
    queryKey: activityKeys.month(month),
    queryFn: () =>
      apiFetch<ActivityMonth>(
        `/api/me/activity?month=${month}&tz=${encodeURIComponent(tz)}`
      ),
  });
}
