import { useCallback, useEffect, useState } from "react";

import { useEyeStrainSettings, useRecordSessions } from "@/lib/eye-strain-queries";
import { useEyeStrainStore } from "@/lib/eye-strain-store";
import { viewTimer, type TimerDurations, type TimerView } from "@/lib/eye-strain-timer";
import {
  DEFAULT_QUIET_HOURS,
  cancelCategory,
  ensurePermission,
  scheduleRepeatingReminder,
} from "@/lib/notifications";

const FALLBACK_DURATIONS: TimerDurations = { intervalMinutes: 20, breakSeconds: 20 };

/**
 * Sayacın canlı görünümü. Kalan süre her tikte duvar saatinden hesaplanıyor
 * (bkz. eye-strain-timer) — tik yalnızca yeniden çizim için.
 */
export function useEyeTimerView(): { view: TimerView; durations: TimerDurations } {
  const { data: settings } = useEyeStrainSettings();
  const phase = useEyeStrainStore((s) => s.phase);
  const startedAt = useEyeStrainStore((s) => s.startedAt);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  const durations = settings ?? FALLBACK_DURATIONS;
  return { view: viewTimer({ phase, startedAt }, durations, now), durations };
}

/**
 * Sayacı başlatma/durdurma ve molayı sonuçlandırma. Hem Bugün kartı hem Göz
 * ekranı aynı eylemleri kullanıyor.
 */
export function useEyeTimerActions() {
  const { data: settings } = useEyeStrainSettings();
  const recordSessions = useRecordSessions();
  const durations = settings ?? FALLBACK_DURATIONS;

  const start = useCallback(async (): Promise<boolean> => {
    const granted = await ensurePermission();
    const store = useEyeStrainStore.getState();
    store.start();

    if (granted) {
      const times = await scheduleRepeatingReminder({
        category: "eye_strain",
        title: "Gözlerine mola ver",
        body: `${durations.breakSeconds} saniye boyunca 6 metre uzağa bak.`,
        intervalSeconds: durations.intervalMinutes * 60,
        quietHours: DEFAULT_QUIET_HOURS,
      });
      store.setScheduled(times.map((t) => t.getTime()));
    } else {
      store.setScheduled([]);
    }
    return granted;
  }, [durations.breakSeconds, durations.intervalMinutes]);

  const stop = useCallback(async () => {
    await cancelCategory("eye_strain");
    useEyeStrainStore.getState().stop();
  }, []);

  /** Mola sonucunu kaydeder ve çalışma fazına döner. */
  const finishBreak = useCallback(
    (status: "COMPLETED" | "SKIPPED") => {
      const store = useEyeStrainStore.getState();
      const at = store.startedAt ?? Date.now();
      store.respond(Date.now());
      recordSessions.mutate([{ status, triggeredAt: new Date(at).toISOString() }]);
      store.start();
    },
    [recordSessions]
  );

  return { start, stop, finishBreak };
}
