import { computeHourlyTargetMl, type NotificationCategory } from "@respira/shared-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import * as Notifications from "expo-notifications";
import { useCallback } from "react";
import { Linking } from "react-native";

import { useEyeStrainStore } from "@/lib/eye-strain-store";
import {
  DEFAULT_QUIET_HOURS,
  cancelCategory,
  ensurePermission,
  scheduleRepeatingReminder,
} from "@/lib/notifications";
import { usePostureProfile, usePostureSession } from "@/lib/posture-queries";
import { useStressProfile } from "@/lib/stress-queries";
import { useEyeTimerActions } from "@/lib/use-eye-timer";
import { useWaterGoal } from "@/lib/water-queries";

/** Hatırlatması olan modüller (kan tahlili takvim hatırlatması ayrı bir akış). */
export type ReminderCategory = Extract<NotificationCategory, "eye_strain" | "water" | "posture" | "stress">;

export type PermissionState = "granted" | "undetermined" | "denied";

/**
 * - on: açıldı
 * - off: kapatıldı
 * - denied: sistem izni yok (iOS'ta bir kez reddedilince tekrar sorulamaz)
 * - setup: önce modülün kurulumu gerekli (ör. su hedefi yok) — çağıran kurulum ekranına götürür
 */
export type ToggleResult = "on" | "off" | "denied" | "setup";

const remindersKey = ["reminders"] as const;

interface ReminderSnapshot {
  scheduled: Record<Exclude<ReminderCategory, "eye_strain">, boolean>;
  permission: PermissionState;
}

async function readSnapshot(): Promise<ReminderSnapshot> {
  const [pending, perm] = await Promise.all([
    Notifications.getAllScheduledNotificationsAsync(),
    Notifications.getPermissionsAsync(),
  ]);
  const has = (c: string) => pending.some((n) => n.content.data?.category === c);

  return {
    scheduled: { water: has("water"), posture: has("posture"), stress: has("stress") },
    permission: perm.granted ? "granted" : perm.canAskAgain ? "undetermined" : "denied",
  };
}

/** Cihaz Ayarlar'ını açar — reddedilmiş bildirim izni için tek çıkış yolu. */
export function openSystemSettings() {
  void Linking.openSettings();
}

/**
 * Hatırlatmaların tek doğruluk kaynağı. Durum, bileşen state'inden değil planlı
 * bildirimlerden okunuyor — ekrandan çıkıp dönünce ya da Ayarlar'dan değişince
 * her yer aynı şeyi gösteriyor.
 *
 * Göz molasının hatırlatması sayaçla birlikte planlandığı için "açık" olması
 * sayacın çalışması demek; aç/kapa sayacı başlatıp durduruyor.
 */
export function useReminders() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: remindersKey, queryFn: readSnapshot });
  const eyePhase = useEyeStrainStore((s) => s.phase);
  const eye = useEyeTimerActions();

  const { data: waterData } = useWaterGoal();
  const goal = waterData?.goal ?? null;
  const { data: postureProfile } = usePostureProfile();
  const hasPosture = !!postureProfile?.profile;
  const { data: postureSession } = usePostureSession(hasPosture);
  const { data: stressData } = useStressProfile();

  // Ayarlar'dan izin verilip dönüldüğünde de güncel görünsün.
  useFocusEffect(
    useCallback(() => {
      void qc.invalidateQueries({ queryKey: remindersKey });
    }, [qc])
  );

  const refresh = useCallback(() => qc.invalidateQueries({ queryKey: remindersKey }), [qc]);

  const isActive = useCallback(
    (category: ReminderCategory): boolean =>
      category === "eye_strain" ? eyePhase !== "idle" : (data?.scheduled[category] ?? false),
    [data, eyePhase]
  );

  const enable = useCallback(
    async (category: ReminderCategory): Promise<ToggleResult> => {
      if (category === "eye_strain") {
        const granted = await eye.start();
        await refresh();
        return granted ? "on" : "denied";
      }

      if (category === "water" && !goal) return "setup";
      if (category === "posture" && !hasPosture) return "setup";

      const granted = await ensurePermission();
      if (!granted) {
        await refresh();
        return "denied";
      }

      if (category === "water" && goal) {
        const hourlyMl = computeHourlyTargetMl({
          dailyTargetMl: goal.dailyTargetMl,
          wakeTime: goal.wakeTime,
          sleepTime: goal.sleepTime,
        });
        await scheduleRepeatingReminder({
          category: "water",
          title: "Su vakti",
          body: `Saatlik hedefin yaklaşık ${hourlyMl}ml. Bir bardak su iyi gelir.`,
          intervalSeconds: 3600,
          quietHours: { start: goal.sleepTime, end: goal.wakeTime },
        });
      } else if (category === "posture") {
        await scheduleRepeatingReminder({
          category: "posture",
          title: "Duruş molası",
          body: `${postureSession?.minutesPerHourAvailable ?? 5} dakikalık kısa bir set seni bekliyor.`,
          intervalSeconds: 3600,
          quietHours: postureSession?.quietHours ?? DEFAULT_QUIET_HOURS,
        });
      } else if (category === "stress") {
        const perDay = stressData?.profile?.desiredSessionsPerDay ?? 4;
        await scheduleRepeatingReminder({
          category: "stress",
          title: "Kısa bir mola",
          body: "Birkaç dakikalık bir nefes egzersizi iyi gelebilir.",
          intervalSeconds: Math.round(86400 / perDay),
          quietHours: DEFAULT_QUIET_HOURS,
        });
      }

      await refresh();
      return "on";
    },
    [eye, goal, hasPosture, postureSession, refresh, stressData]
  );

  const disable = useCallback(
    async (category: ReminderCategory): Promise<ToggleResult> => {
      if (category === "eye_strain") await eye.stop();
      else await cancelCategory(category);
      await refresh();
      return "off";
    },
    [eye, refresh]
  );

  const toggle = useCallback(
    (category: ReminderCategory) => (isActive(category) ? disable(category) : enable(category)),
    [disable, enable, isActive]
  );

  return {
    isActive,
    enable,
    disable,
    toggle,
    permission: data?.permission ?? ("undetermined" as PermissionState),
  };
}
