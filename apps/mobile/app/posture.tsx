import { router } from "expo-router";
import { Bell, PersonStanding, Sparkles, TrendingUp } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { FeatureIntro } from "@/components/FeatureIntro";
import { ProgressRing } from "@/components/ProgressRing";
import { Button, Card, Screen, Text } from "@/components/ui";
import { formatRemaining } from "@/lib/eye-strain-timer";
import {
  DEFAULT_QUIET_HOURS,
  cancelCategory,
  ensurePermission,
  scheduleRepeatingReminder,
} from "@/lib/notifications";
import {
  usePostureProfile,
  usePostureSession,
  useRecordBreak,
  useTodayBreaks,
} from "@/lib/posture-queries";
import { useThemeStore } from "@/theme/theme-store";
import { darkPalette, lightPalette } from "@/theme/tokens";

const rgb = (c: string) => `rgb(${c.split(" ").join(", ")})`;

export default function PostureScreen() {
  const { data: profileData, isPending } = usePostureProfile();
  const profile = profileData?.profile ?? null;
  const { data: session, isPending: sessionPending } = usePostureSession(!!profile);
  const { data: breaks } = useTodayBreaks(!!profile);
  const record = useRecordBreak();

  const preference = useThemeStore((s) => s.preference);
  const palette = preference === "light" ? lightPalette : darkPalette;

  const [running, setRunning] = useState(false);
  const [index, setIndex] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [notifyState, setNotifyState] = useState<"idle" | "on" | "denied">("idle");

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [running]);

  const exercises = session?.set.exercises ?? [];
  const current = exercises[index];
  const elapsed = startedAt ? (now - startedAt) / 1000 : 0;
  const remaining = current ? Math.max(0, current.seconds - elapsed) : 0;
  const progress = current ? Math.min(1, elapsed / current.seconds) : 0;

  // Hareketin süresi dolunca sıradakine geç; set bitince tamamlandı say.
  // Bu bir zamanlayıcıya bağlı durum makinesi — dış "now" sayacı değiştikçe
  // adım ilerlemesi kaçınılmaz olarak effect içinde tetikleniyor.
  useEffect(() => {
    if (!running || !current || remaining > 0) return;
    if (index + 1 < exercises.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIndex(index + 1);
      setStartedAt(Date.now());
    } else {
      finish("COMPLETED");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, remaining, index, exercises.length]);

  function start() {
    setIndex(0);
    setStartedAt(Date.now());
    setRunning(true);
  }

  function finish(status: "COMPLETED" | "SKIPPED") {
    setRunning(false);
    setStartedAt(null);
    record.mutate({
      status,
      triggeredAt: new Date().toISOString(),
      exerciseSetId: session?.set.id ?? null,
    });
  }

  /**
   * docs/05: saat başı hatırlatma, yalnızca mesai saatleri içinde.
   * Mesai penceresi sunucuda sessiz saat aralığına çevrilmiş olarak geliyor —
   * planlayıcı o pencereye düşen tetiklemeleri atlıyor.
   */
  async function enableReminders() {
    const granted = await ensurePermission();
    if (!granted) {
      setNotifyState("denied");
      return;
    }
    await scheduleRepeatingReminder({
      category: "posture",
      title: "Duruş molası",
      body: `${session?.minutesPerHourAvailable ?? 5} dakikalık kısa bir set seni bekliyor.`,
      intervalSeconds: 3600,
      quietHours: session?.quietHours ?? DEFAULT_QUIET_HOURS,
    });
    setNotifyState("on");
  }

  if (isPending) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator />
      </Screen>
    );
  }

  if (!profile) {
    return (
      <FeatureIntro
        icon={PersonStanding}
        title="Duruş molalarına başla"
        subtitle="Çalışma şeklini ve saat başı ayırabileceğin süreyi söyle; sana ortamına uygun, ekipman gerektirmeyen hareketler önerelim."
        benefits={[
          { icon: Sparkles, title: "Kişiye özel set", body: "Çalışma şekline ve süren göre hazırlanan hareketler." },
          { icon: Bell, title: "Saat başı hatırlatma", body: "Yalnızca mesai saatlerinde, nazikçe hatırlatır." },
          { icon: TrendingUp, title: "İlerleme takibi", body: "Tamamlanan/atlanan molalarını günlük gör." },
        ]}
        ctaLabel="Formu doldur"
        ctaIcon={Sparkles}
        onPress={() => router.push("/posture-form")}
      />
    );
  }

  // --- MOLA ÇALIŞIYOR ---
  if (running && current) {
    return (
      <Screen className="items-center justify-center gap-6 p-6">
        <View className="items-center gap-1">
          <Text variant="label" muted>
            HAREKET {index + 1} / {exercises.length}
          </Text>
          <Text variant="title" className="text-center">
            {current.name}
          </Text>
        </View>

        <ProgressRing progress={progress} color={rgb(palette.accent)} trackColor={rgb(palette.border)}>
          <Text variant="displayXl">{formatRemaining(remaining)}</Text>
        </ProgressRing>

        <Text variant="body" className="text-center">
          {current.instruction}
        </Text>

        <View className="w-full gap-2">
          <Button
            title={index + 1 < exercises.length ? "Sonraki hareket" : "Bitir"}
            onPress={() => {
              if (index + 1 < exercises.length) {
                setIndex(index + 1);
                setStartedAt(Date.now());
              } else {
                finish("COMPLETED");
              }
            }}
          />
          <Button title="Molayı atla" variant="ghost" onPress={() => finish("SKIPPED")} />
        </View>
      </Screen>
    );
  }

  // --- ANA EKRAN ---
  const today = breaks?.today;
  return (
    <Screen edges={["top"]}>
      <ScrollView contentContainerClassName="gap-6 p-4 pb-12">
        <View className="gap-1">
          <Text variant="label" muted>
            DURUŞ
          </Text>
          <Text variant="displayLg">Mola</Text>
        </View>

        <Card className="gap-2">
          <Text variant="label" muted>
            BUGÜN
          </Text>
          <View className="flex-row items-baseline gap-2">
            <Text variant="displayXl">{today?.COMPLETED ?? 0}</Text>
            <Text variant="title" muted>
              mola tamamlandı
            </Text>
          </View>
          {today && today.SKIPPED + today.MISSED > 0 ? (
            <Text variant="data" muted>
              Atlanan {today.SKIPPED} · Kaçırılan {today.MISSED}
            </Text>
          ) : null}
        </Card>

        {session ? (
          <Card className="gap-3">
            <View className="flex-row items-baseline gap-2">
              <Text variant="title">Sıradaki set</Text>
              <Text variant="label" muted>
                {Math.round(session.set.totalSeconds / 60)} dk · {session.set.exercises.length} hareket
              </Text>
            </View>
            {session.set.exercises.map((e) => (
              <View key={e.id} className="gap-0.5">
                <Text variant="label">{e.name}</Text>
                <Text variant="bodySm" muted>
                  {e.instruction}
                </Text>
              </View>
            ))}
            <Button title="Molaya başla" onPress={start} />
          </Card>
        ) : sessionPending ? (
          // Set verisi biraz gecikebiliyor — yer tutucu olmadan kart aniden
          // belirip layout'u sıçratıyordu, bu yüzden aynı boyutta bir iskelet.
          <Card className="gap-3">
            <View className="flex-row items-baseline gap-2">
              <Text variant="title">Sıradaki set</Text>
              <ActivityIndicator size="small" color={rgb(palette.accent)} />
            </View>
            <Text variant="bodySm" muted>
              Sana uygun hareketler hazırlanıyor…
            </Text>
          </Card>
        ) : null}

        {/* docs/05 — meslek türüne göre rotasyonlu bilgi notu */}
        {session?.fyi ? (
          <Card className="gap-1">
            <Text variant="label" muted>
              BİLİYOR MUYDUN
            </Text>
            <Text variant="body">{session.fyi.text}</Text>
          </Card>
        ) : null}

        <Card className="gap-3">
          <Text variant="title">Hatırlatmalar</Text>
          <Text variant="bodySm" muted>
            {session?.quietHours
              ? `Saat başı hatırlatma yalnızca mesai saatlerinde (${session.quietHours.end}-${session.quietHours.start}) gelir.`
              : "Mesai saati tanımlamadığın için hatırlatmalar gün boyu gelebilir."}
          </Text>
          <Button
            title={notifyState === "on" ? "Hatırlatmalar açık" : "Saat başı hatırlat"}
            variant={notifyState === "on" ? "secondary" : "primary"}
            onPress={enableReminders}
          />
          {notifyState === "on" ? (
            <Button
              title="Hatırlatmaları kapat"
              variant="ghost"
              onPress={async () => {
                await cancelCategory("posture");
                setNotifyState("idle");
              }}
            />
          ) : null}
          {notifyState === "denied" ? (
            <Text variant="bodySm" className="text-warm">
              Bildirim izni verilmedi. Molaları elle başlatabilirsin.
            </Text>
          ) : null}
        </Card>

        <Button title="Formu düzenle" variant="secondary" onPress={() => router.push("/posture-form")} />

        <Text variant="bodySm" muted>
          Bu öneriler genel ergonomi bilgisidir, tıbbi tavsiye değildir.
        </Text>
      </ScrollView>
    </Screen>
  );
}
