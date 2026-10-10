import type { BreathingPhase } from "@respira/shared-types";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useMotion } from "@/theme/use-motion";

const SIZE = 300;
const MIN_SCALE = 0.7;

interface Props {
  /** docs/07 — seçilen tekniğin gerçek faz süreleri (inhale/hold/exhale). */
  phases: readonly BreathingPhase[];
  /** false iken orb dinlenme boyutunda durur (egzersiz başlamadan önceki önizleme). */
  running: boolean;
  children?: React.ReactNode;
}

/**
 * Lavanta Blok nefes orb'u: üç iç içe daire (yarı saydam beyaz 290/220, dolgu
 * beyaz 150) nefes al → büyür, nefes ver → küçülür. Tutma fazlarında mevcut
 * boyutta kalır. docs/07 kabul kriteri: animasyon seçilen tekniğin GERÇEK
 * ritmiyle senkron — bu yüzden faz dizisinden bir Reanimated dizisi kuruluyor.
 * Hareket azaltma açıkken orb sabit orta boyda kalır.
 */
export function BreathingOrb({ phases, running, children }: Props) {
  const { reduced } = useMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      progress.value = withTiming(0.5, { duration: 400 });
      return;
    }
    if (!running) {
      progress.value = withTiming(0, { duration: 800 });
      return;
    }

    // inhale 0→1, exhale 1→0, hold mevcut seviyede sabit (aynı değere withTiming).
    let level = 0;
    const steps = phases.map((phase) => {
      const duration = phase.seconds * 1000;
      if (phase.type === "inhale") {
        level = 1;
        return withTiming(1, { duration, easing: Easing.inOut(Easing.ease) });
      }
      if (phase.type === "exhale") {
        level = 0;
        return withTiming(0, { duration, easing: Easing.inOut(Easing.ease) });
      }
      return withTiming(level, { duration, easing: Easing.linear });
    });

    progress.value = withRepeat(withSequence(...steps), -1, false);
  }, [reduced, running, phases, progress]);

  const scale = useAnimatedStyle(() => ({ transform: [{ scale: MIN_SCALE + (1 - MIN_SCALE) * progress.value }] }));

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={[{ position: "absolute", width: 290, height: 290, borderRadius: 145, backgroundColor: "rgba(255,255,255,.22)" }, scale]}
      />
      <Animated.View
        style={[{ position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(255,255,255,.35)" }, scale]}
      />
      <Animated.View
        style={[{ position: "absolute", width: 150, height: 150, borderRadius: 75, backgroundColor: "#FFFFFF" }, scale]}
      />
      {children ? <View style={{ alignItems: "center", gap: 2 }}>{children}</View> : null}
    </View>
  );
}
