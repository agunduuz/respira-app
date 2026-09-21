import { Link } from "expo-router";
import { BarChart3, ChevronRight, Clock, Play, Square } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { InfoTip } from "@/components/InfoTip";
import { ProgressRing } from "@/components/ProgressRing";
import { Button, Card, Screen, Text } from "@/components/ui";
import { useEyeStrainAnalytics } from "@/lib/eye-strain-queries";
import { formatRemaining } from "@/lib/eye-strain-timer";
import { EYE_TIPS, tipOfTheDay } from "@/lib/tips";
import { useEyeTimerActions, useEyeTimerView } from "@/lib/use-eye-timer";
import { useMotion } from "@/theme/use-motion";
import { rgb, usePalette } from "@/theme/use-palette";

export default function EyeScreen() {
  const palette = usePalette();

  const { data: analytics } = useEyeStrainAnalytics("daily");
  const { view, durations } = useEyeTimerView();
  const { start, stop, finishBreak } = useEyeTimerActions();
  const [permission, setPermission] = useState<boolean | null>(null);

  // Sayaç ilk göründüğünde hafif bir fade+scale — reduced motion'da anında biter.
  const { duration: motionDuration } = useMotion();
  const enter = useSharedValue(0);
  useEffect(() => {
    enter.value = withTiming(1, { duration: motionDuration.standard });
    // Sadece mount'ta çalışsın.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const enterStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ scale: 0.96 + enter.value * 0.04 }],
  }));

  async function startTimer() {
    setPermission(await start());
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

  const completedToday = analytics?.totals.completed ?? null;
  const triggeredToday = analytics?.totals.triggered ?? null;

  // --- SAYAÇ EKRANI ---
  return (
    <Screen edges={["bottom"]}>
      <ScrollView contentContainerClassName="gap-6 p-5 pb-12">
        <Animated.View style={enterStyle} className="flex-row items-start justify-between">
          <View className="gap-1">
            <Text variant="label" muted>
              GÖZ MOLASI
            </Text>
            <Text variant="displayLg">20-20-20</Text>
          </View>
          <StatusPill running={view.phase === "working"} accent={rgb(palette.accent)} muted={rgb(palette.textMuted)} />
        </Animated.View>

        <Animated.View style={enterStyle} className="items-center gap-3 py-4">
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

          {triggeredToday !== null && triggeredToday > 0 ? (
            <Text variant="data" muted>
              Bugün {completedToday}/{triggeredToday} mola tamamlandı
            </Text>
          ) : null}
        </Animated.View>

        {view.phase === "working" ? (
          <Button
            title="Sayacı durdur"
            variant="secondary"
            icon={Square}
            iconColor={rgb(palette.text)}
            onPress={() => void stop()}
          />
        ) : (
          <Button title="Sayacı başlat" icon={Play} iconColor={rgb(palette.onAccent)} onPress={() => void startTimer()} />
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

        <View className="gap-2">
          <View className="flex-row items-baseline justify-between px-1">
            <Text variant="title">Ayarlar</Text>
            <Text variant="data" muted>
              {durations.intervalMinutes} dk · {durations.breakSeconds} sn
            </Text>
          </View>
          <Card className="gap-0 p-0">
            <SettingsRow
              href="/eye-strain-settings"
              icon={Clock}
              label="Süreleri değiştir"
              accent={rgb(palette.accent)}
              muted={rgb(palette.textMuted)}
            />
            <View className="h-px bg-border" />
            <SettingsRow
              href="/eye-analysis"
              icon={BarChart3}
              label="Uyum analizi"
              accent={rgb(palette.accent)}
              muted={rgb(palette.textMuted)}
            />
          </Card>
        </View>

        <InfoTip text={tipOfTheDay(EYE_TIPS)} />

        <Text variant="bodySm" muted>
          Bu uygulama bir sağlık hizmeti sağlamaz, yalnızca bir hatırlatma aracıdır.
        </Text>
      </ScrollView>
    </Screen>
  );
}

/** Durumu sadece metinle değil, renkli bir noktayla da taşıyan küçük rozet. */
function StatusPill({ running, accent, muted }: { running: boolean; accent: string; muted: string }) {
  return (
    <View className="flex-row items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5">
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: running ? accent : muted,
        }}
      />
      <Text variant="label" muted={!running}>
        {running ? "Çalışıyor" : "Hazır"}
      </Text>
    </View>
  );
}

/** Ayarlar kartındaki dokunulabilir satır — ikon + etiket + chevron. */
function SettingsRow({
  href,
  icon: Icon,
  label,
  accent,
  muted,
}: {
  href: "/eye-strain-settings" | "/eye-analysis";
  icon: typeof Clock;
  label: string;
  accent: string;
  muted: string;
}) {
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        className="flex-row items-center gap-3 px-5 py-3.5"
        style={{ minHeight: 48 }}
      >
        {({ pressed }) => (
          <View className="flex-1 flex-row items-center gap-3" style={{ opacity: pressed ? 0.65 : 1 }}>
            <View
              className="items-center justify-center rounded-full bg-accent/10"
              style={{ width: 32, height: 32 }}
            >
              <Icon size={16} strokeWidth={1.75} color={accent} />
            </View>
            <Text variant="body" className="flex-1">
              {label}
            </Text>
            <ChevronRight size={18} strokeWidth={1.75} color={muted} />
          </View>
        )}
      </Pressable>
    </Link>
  );
}
