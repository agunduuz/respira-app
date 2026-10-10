import { router, useLocalSearchParams } from "expo-router";
import { Bell, PersonStanding, Sparkles, TrendingUp } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { FeatureIntro } from "@/components/FeatureIntro";
import { PermissionHint } from "@/components/PermissionHint";
import { Rings } from "@/components/Rings";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Button, Icon, Screen, Text } from "@/components/ui";
import { formatRemaining } from "@/lib/eye-strain-timer";
import {
  usePostureProfile,
  usePostureSession,
  useRecordBreak,
  useTodayBreaks,
} from "@/lib/posture-queries";
import { useReminders } from "@/lib/use-reminders";
import { cn } from "@/theme/cn";

const TILE_TONES = ["bg-t200", "bg-t100", "bg-t300", "bg-t400"] as const;

export default function PostureScreen() {
  const { data: profileData, isPending } = usePostureProfile();
  const profile = profileData?.profile ?? null;
  const { data: session, isPending: sessionPending } = usePostureSession(!!profile);
  const { data: breaks } = useTodayBreaks(!!profile);
  const record = useRecordBreak();

  // Bugün ekranındaki "Molaya başla" doğrudan seti başlatır (?start=1).
  const { start: startParam } = useLocalSearchParams<{ start?: string }>();
  const autoStarted = useRef(false);

  const [running, setRunning] = useState(false);
  const [index, setIndex] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const reminders = useReminders();
  const reminderOn = reminders.isActive("posture");

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

  useEffect(() => {
    if (startParam !== "1" || autoStarted.current) return;
    if (!profile || exercises.length === 0) return;
    autoStarted.current = true;
    start();
  }, [startParam, profile, exercises.length]);

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
      <View className="flex-1 bg-t400">
        <Screen transparent edges={["top", "bottom"]} className="items-center justify-center gap-6 px-5 py-4">
          <View className="items-center gap-2">
            <View className="rounded-[14px] bg-t900 px-[14px] py-[7px]">
              <Text variant="label" className="text-white">
                Hareket {index + 1} / {exercises.length}
              </Text>
            </View>
            <Text variant="headline" className="text-center">
              {current.name}
            </Text>
          </View>

          <Rings
            size={240}
            strokeWidth={16}
            trackColor="rgba(30,24,48,.14)"
            rings={[{ r: 106, value: progress, color: "#140F24" }]}
          >
            <Text variant="numHero" className="text-[64px] leading-[80px]">
              {formatRemaining(remaining)}
            </Text>
          </Rings>

          <Text variant="body" className="text-center font-bodyMedium">
            {current.instruction}
          </Text>

          <View className="w-full flex-row items-center gap-[10px]">
            <Button
              title={index + 1 < exercises.length ? "Sonraki hareket" : "Bitir"}
              className="flex-1"
              onPress={() => {
                if (index + 1 < exercises.length) {
                  setIndex(index + 1);
                  setStartedAt(Date.now());
                } else {
                  finish("COMPLETED");
                }
              }}
            />
            <Button title="Atla" variant="secondary" className="w-[100px]" onPress={() => finish("SKIPPED")} />
          </View>
        </Screen>
      </View>
    );
  }

  // --- ANA EKRAN ---
  const today = breaks?.today;
  const doneToday = today?.COMPLETED ?? 0;

  return (
    <Screen edges={["top", "bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-[14px] px-[18px] pb-10 pt-2">
        <ScreenHeader title="Postür" right={{ icon: "work", label: "Çalışma profilini düzenle", onPress: () => router.push("/posture-form") }} />

        {/* Bugün */}
        <View className="gap-2 rounded-blockLg bg-t400 p-5">
          <View className="self-start rounded-[12px] bg-white/55 px-[11px] py-[5px]">
            <Text variant="caption">Bugün</Text>
          </View>
          <View className="flex-row items-end justify-between">
            <Text variant="headline" className="leading-[32px]">
              {doneToday} mola{"\n"}tamamlandı
            </Text>
            <View className="h-[54px] w-[54px] items-center justify-center rounded-full bg-t900">
              <Icon name="accessibility_new" size={28} className="text-white" />
            </View>
          </View>
          {today && today.SKIPPED + today.MISSED > 0 ? (
            <Text variant="bodySm" className="font-bodySemiBold">
              Atlanan {today.SKIPPED} · Kaçırılan {today.MISSED}
            </Text>
          ) : null}
        </View>

        {/* Sıradaki set */}
        {session ? (
          <>
            <View className="flex-row items-baseline justify-between px-1">
              <Text variant="title">Sıradaki set</Text>
              <Text variant="label" muted>
                {Math.round(session.set.totalSeconds / 60)} dk · {session.set.exercises.length} hareket
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-[10px]">
              {session.set.exercises.map((e, i) => (
                <View
                  key={e.id}
                  className={cn("min-h-[150px] w-[48.4%] gap-[10px] rounded-card p-[14px]", TILE_TONES[i % TILE_TONES.length])}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="rounded-[11px] bg-white/60 px-[10px] py-1">
                      <Text variant="caption" className="text-[11px] font-heavy">
                        {Math.max(1, Math.round(e.seconds / 60))} dk
                      </Text>
                    </View>
                    <View className="h-[32px] w-[32px] items-center justify-center rounded-full bg-t900">
                      <Icon name="play_arrow" size={18} className="text-white" />
                    </View>
                  </View>
                  <Text variant="title" className="mt-auto text-[17px] leading-[22px]">
                    {e.name}
                  </Text>
                  <Text variant="caption" className="font-bodySemiBold" numberOfLines={3}>
                    {e.instruction}
                  </Text>
                </View>
              ))}
            </View>
            <Button title="Molaya başla" onPress={start} />
          </>
        ) : sessionPending ? (
          // Set verisi biraz gecikebiliyor — yer tutucu olmadan kart aniden
          // belirip layout'u sıçratıyordu, bu yüzden aynı boyutta bir iskelet.
          <View className="min-h-[150px] items-center justify-center gap-2 rounded-card bg-white p-4">
            <ActivityIndicator />
            <Text variant="bodySm" muted>
              Sana uygun hareketler hazırlanıyor…
            </Text>
          </View>
        ) : null}

        {/* docs/05 — meslek türüne göre rotasyonlu bilgi notu */}
        {session?.fyi ? (
          <View className="gap-2 rounded-card bg-t900 p-[18px]">
            <Text variant="label" className="tracking-widest text-t300">
              MESLEĞİNE ÖZEL NOT
            </Text>
            <Text variant="body" className="font-bodyMedium leading-[23px] text-white">
              {session.fyi.text}
            </Text>
          </View>
        ) : null}

        {/* Hatırlatmalar */}
        <View className="gap-3 rounded-card bg-white p-4">
          <Text variant="title">Hatırlatmalar</Text>
          <Text variant="bodySm" muted>
            {session?.quietHours
              ? `Saat başı hatırlatma yalnızca mesai saatlerinde (${session.quietHours.end}-${session.quietHours.start}) gelir.`
              : "Mesai saati tanımlamadığın için hatırlatmalar gün boyu gelebilir."}
          </Text>
          <Button
            title={reminderOn ? "Hatırlatmalar açık" : "Saat başı hatırlat"}
            variant={reminderOn ? "secondary" : "primary"}
            className={reminderOn ? "border-[1.5px] border-line" : undefined}
            onPress={() => void reminders.enable("posture")}
          />
          {reminderOn ? (
            <Button title="Hatırlatmaları kapat" variant="ghost" onPress={() => void reminders.disable("posture")} />
          ) : null}
          {reminders.permission === "denied" ? <PermissionHint fallback="Molaları elle başlatabilirsin." /> : null}
        </View>

        <Button
          title="Formu düzenle"
          variant="secondary"
          className="border-[1.5px] border-line"
          onPress={() => router.push("/posture-form")}
        />

        <Text variant="bodySm" muted className="px-1">
          Bu öneriler genel ergonomi bilgisidir, tıbbi tavsiye değildir.
        </Text>
      </ScrollView>
    </Screen>
  );
}
