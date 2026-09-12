import type { RecordEyeStrainSessionInput } from "@respira/shared-types";
import { Link } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, ScrollView, View } from "react-native";

import { ProgressRing } from "@/components/ProgressRing";
import { Button, Card, Screen, Text } from "@/components/ui";
import { useEyeStrainSettings, useRecordSessions } from "@/lib/eye-strain-queries";
import { useEyeStrainStore } from "@/lib/eye-strain-store";
import { formatRemaining, viewTimer } from "@/lib/eye-strain-timer";
import {
  DEFAULT_QUIET_HOURS,
  cancelCategory,
  ensurePermission,
  findMissedTriggers,
  scheduleRepeatingReminder,
} from "@/lib/notifications";
import { useThemeStore } from "@/theme/theme-store";
import { darkPalette, lightPalette } from "@/theme/tokens";

const rgb = (c: string) => `rgb(${c.split(" ").join(", ")})`;

export default function TimerScreen() {
  const preference = useThemeStore((s) => s.preference);
  const palette = preference === "light" ? lightPalette : darkPalette;

  const { data: settings } = useEyeStrainSettings();
  const recordSessions = useRecordSessions();
  const store = useEyeStrainStore();
  const [now, setNow] = useState(() => Date.now());
  const [permission, setPermission] = useState<boolean | null>(null);

  useEffect(() => {
    void store.hydrate();
    // hydrate yalnızca bir kez çalışmalı.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ekran görünürken saniyede bir tik. Sayaç bu tike GÜVENMİYOR — kalan süre
  // her seferinde duvar saatinden hesaplanıyor, tik sadece yeniden çizim için.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  const durations = settings ?? { intervalMinutes: 20, breakSeconds: 20 };
  const view = viewTimer(store, durations, now);

  /** Mola sonucunu kaydeder ve çalışma fazına döner. */
  const finishBreak = useCallback(
    (status: "COMPLETED" | "SKIPPED") => {
      const at = store.startedAt ?? Date.now();
      store.respond(Date.now());
      recordSessions.mutate([{ status, triggeredAt: new Date(at).toISOString() }]);
      store.start();
    },
    [store, recordSessions]
  );

  // Çalışma fazı dolduğunda mola fazına geç.
  useEffect(() => {
    if (view.phase === "working" && view.elapsed) {
      store.beginBreak();
    }
  }, [view.phase, view.elapsed, store]);

  // Mola süresi dolarsa kullanıcı yanıtlamamış demektir — otomatik tamamlandı
  // saymıyoruz; kullanıcı ekranı görüp karar verene kadar mola ekranı kalıyor.

  // Uygulama öne geldiğinde kaçırılan molaları uzlaştır.
  const reconciling = useRef(false);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active" || reconciling.current) return;
      const s = useEyeStrainStore.getState();
      if (!s.hydrated || s.scheduledAt.length === 0) return;

      const missed = findMissedTriggers({
        scheduled: s.scheduledAt.map((t) => new Date(t)),
        now: new Date(),
        lastRespondedAt: s.lastRespondedAt ? new Date(s.lastRespondedAt) : null,
      });
      if (missed.length === 0) return;

      reconciling.current = true;
      const rows: RecordEyeStrainSessionInput[] = missed.map((d) => ({
        status: "MISSED",
        triggeredAt: d.toISOString(),
      }));
      recordSessions.mutate(rows, {
        onSettled: () => {
          reconciling.current = false;
        },
        onSuccess: () => s.respond(Date.now()),
      });
    });
    return () => sub.remove();
  }, [recordSessions]);

  async function startTimer() {
    const granted = await ensurePermission();
    setPermission(granted);

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
  }

  async function stopTimer() {
    await cancelCategory("eye_strain");
    store.stop();
  }

  // --- MOLA EKRANI ---
  if (view.phase === "breaking") {
    return (
      <Screen className="items-center justify-center gap-8 p-6">
        <View className="items-center gap-2">
          <Text variant="label" muted>
            MOLA
          </Text>
          <Text variant="title" className="text-center">
            6 metre uzağa bak
          </Text>
        </View>

        <ProgressRing
          progress={view.progress}
          color={rgb(palette.accent)}
          trackColor={rgb(palette.border)}
        >
          <Text variant="displayXl">{formatRemaining(view.remainingSeconds)}</Text>
        </ProgressRing>

        <View className="w-full gap-2">
          <Button title="Tamamladım" onPress={() => finishBreak("COMPLETED")} />
          <Button title="Atla" variant="ghost" onPress={() => finishBreak("SKIPPED")} />
        </View>
      </Screen>
    );
  }

  // --- SAYAÇ EKRANI ---
  return (
    <Screen edges={["top"]}>
      <ScrollView contentContainerClassName="gap-6 p-4 pb-12">
        <View className="gap-1">
          <Text variant="label" muted>
            GÖZ MOLASI
          </Text>
          <Text variant="displayLg">20-20-20</Text>
        </View>

        <View className="items-center py-4">
          <ProgressRing
            progress={view.progress}
            color={rgb(palette.accent)}
            trackColor={rgb(palette.border)}
          >
            {view.phase === "working" ? (
              <>
                <Text variant="displayXl">{formatRemaining(view.remainingSeconds)}</Text>
                <Text variant="label" muted>
                  SONRAKİ MOLAYA
                </Text>
              </>
            ) : (
              <Text variant="title" muted>
                Hazır
              </Text>
            )}
          </ProgressRing>
        </View>

        {view.phase === "working" ? (
          <Button title="Sayacı durdur" variant="secondary" onPress={stopTimer} />
        ) : (
          <Button title="Sayacı başlat" onPress={startTimer} />
        )}

        {permission === false ? (
          <Card className="gap-1 border-warm">
            <Text variant="label" className="text-warm">
              BİLDİRİM İZNİ YOK
            </Text>
            <Text variant="bodySm" muted>
              Sayaç çalışmaya devam eder, ancak uygulama kapalıyken hatırlatma
              gönderilemez. İzni cihaz ayarlarından açabilirsin.
            </Text>
          </Card>
        ) : null}

        <Card className="gap-2">
          <Text variant="title">Ayarlar</Text>
          <Text variant="data" muted>
            {durations.intervalMinutes} dk çalışma · {durations.breakSeconds} sn mola
          </Text>
          <Link href="/eye-strain-settings" asChild>
            <Button title="Süreleri değiştir" variant="secondary" />
          </Link>
          <Link href="/eye-analysis" asChild>
            <Button title="Uyum analizi" variant="secondary" />
          </Link>
        </Card>

        <Text variant="bodySm" muted>
          Bu uygulama bir sağlık hizmeti sağlamaz, yalnızca bir hatırlatma aracıdır.
        </Text>
      </ScrollView>
    </Screen>
  );
}
