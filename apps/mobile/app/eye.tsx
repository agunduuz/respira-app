import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EyeCompliance } from "@/components/EyeCompliance";
import { InfoTip } from "@/components/InfoTip";
import { Rings } from "@/components/Rings";
import { Button, Icon, IconButton, Screen, Text } from "@/components/ui";
import { formatRemaining } from "@/lib/eye-strain-timer";
import { EYE_TIPS, tipOfTheDay } from "@/lib/tips";
import { useEyeTimerActions, useEyeTimerView } from "@/lib/use-eye-timer";
import { useMotion } from "@/theme/use-motion";

/**
 * Göz molası (Lavanta Blok): t200 başlık bloğunda büyük halka + sayaç, altında
 * Uyum kartı. Sayaç üç evreli: hazır → çalışıyor (sonraki molaya) → mola
 * (20 saniye, halka nefes alır). Bildirim izni uyarısı ve günün notu altta.
 */
export default function EyeScreen() {
  const insets = useSafeAreaInsets();
  const { view, durations } = useEyeTimerView();
  const { start, stop, finishBreak } = useEyeTimerActions();
  const [permission, setPermission] = useState<boolean | null>(null);
  const { reduced } = useMotion();

  const breaking = view.phase === "breaking";
  const working = view.phase === "working";

  // Mola sırasında halkanın içindeki hale nefes gibi büyüyüp küçülür (tasarımdaki eyeHalo).
  const halo = useSharedValue(1);
  useEffect(() => {
    if (breaking && !reduced) {
      halo.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.92, { duration: 2500, easing: Easing.inOut(Easing.ease) })
        ),
        -1
      );
    } else {
      cancelAnimation(halo);
      halo.value = withTiming(1, { duration: 400 });
    }
    return () => cancelAnimation(halo);
  }, [breaking, reduced, halo]);
  const haloStyle = useAnimatedStyle(() => ({ transform: [{ scale: halo.value }] }));

  async function startTimer() {
    setPermission(await start());
  }

  const message = breaking
    ? "Pencereden dışarı, 6 metre uzağa bak. Göz kırpmayı unutma."
    : working
      ? "Sayaç çalışıyor. Süre dolunca 20 saniyelik bir mola vereceğiz."
      : `${durations.intervalMinutes} dakikada bir ${durations.breakSeconds} saniye uzağa bak. Hazırsan başlat.`;

  return (
    <Screen edges={[]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-[18px] pb-10">
        <View className="gap-[14px] rounded-b-sheet bg-t200 px-[22px] pb-6" style={{ paddingTop: insets.top + 8 }}>
          <View className="flex-row items-center justify-between">
            <IconButton icon="arrow_back" label="Geri" variant="light" onPress={() => router.back()} />
            <View className="rounded-[14px] bg-white/55 px-[14px] py-[7px]">
              <Text variant="label">
                {durations.intervalMinutes} dk · {durations.breakSeconds} sn · 6 m
              </Text>
            </View>
            <IconButton
              icon="tune"
              iconSize={22}
              label="Süreleri değiştir"
              variant="light"
              onPress={() => router.push("/eye-strain-settings")}
            />
          </View>

          <Text variant="headline" className="mt-2">
            Göz molası
          </Text>
          <Text variant="body" className="min-h-[40px] font-bodyMedium leading-[20px]">
            {message}
          </Text>

          <View className="self-center">
            <Rings
              size={240}
              strokeWidth={16}
              trackColor="rgba(30,24,48,.12)"
              rings={[{ r: 106, value: view.phase === "idle" ? 0 : view.progress, color: "#140F24" }]}
            >
              <Animated.View
                pointerEvents="none"
                style={[
                  { position: "absolute", top: 34, left: 34, right: 34, bottom: 34, borderRadius: 999, backgroundColor: "rgba(255,255,255,.5)" },
                  haloStyle,
                ]}
              />
              {breaking ? (
                <>
                  <Text variant="numHero" className="text-[80px] leading-[80px] tracking-tighter">
                    {view.remainingSeconds}
                  </Text>
                  <Text variant="label" className="text-[15px] font-heavy">
                    saniye
                  </Text>
                </>
              ) : working ? (
                <>
                  <Text variant="numHero" className="text-[58px] leading-[60px] tracking-tighter">
                    {formatRemaining(view.remainingSeconds)}
                  </Text>
                  <Text variant="label" className="text-[15px] font-heavy">
                    sonraki molaya
                  </Text>
                </>
              ) : (
                <>
                  <Text variant="numHero" className="text-[48px] leading-[52px]">
                    Hazır
                  </Text>
                  <Text variant="label" className="text-[15px] font-heavy">
                    sayaç duruyor
                  </Text>
                </>
              )}
            </Rings>
          </View>

          <View className="mt-1 flex-row gap-[10px]">
            {breaking ? (
              <>
                <Button title="Tamamladım" className="flex-1" onPress={() => finishBreak("COMPLETED")} />
                <Button title="Atla" variant="secondary" className="w-[100px]" onPress={() => finishBreak("SKIPPED")} />
              </>
            ) : working ? (
              <Button title="Sayacı durdur" variant="secondary" className="flex-1" onPress={() => void stop()} />
            ) : (
              <Button title="Sayacı başlat" className="flex-1" onPress={() => void startTimer()} />
            )}
          </View>
        </View>

        <View className="gap-[18px] px-[18px]">
          {permission === false ? (
            <View className="gap-1 rounded-card border-[1.5px] border-t500 bg-white p-4" accessibilityRole="alert">
              <Text variant="label" className="text-t600">
                Bildirim izni yok
              </Text>
              <Text variant="bodySm" muted>
                Sayaç çalışmaya devam eder, ancak uygulama kapalıyken hatırlatma gönderilemez. İzni cihaz ayarlarından açabilirsin.
              </Text>
            </View>
          ) : null}

          <EyeCompliance />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Uyum analizi"
            onPress={() => router.push("/eye-analysis")}
            className="flex-row items-center gap-3 rounded-card bg-t100 px-4 py-[14px]"
          >
            <Icon name="monitoring" size={24} />
            <Text variant="subhead" className="flex-1">
              Ayrıntılı uyum analizi
            </Text>
            <Icon name="chevron_right" size={24} />
          </Pressable>

          <InfoTip text={tipOfTheDay(EYE_TIPS)} />

          <Text variant="bodySm" muted className="px-1">
            Bu uygulama bir sağlık hizmeti sağlamaz, yalnızca bir hatırlatma aracıdır.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
