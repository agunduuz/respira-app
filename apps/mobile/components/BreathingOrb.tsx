import type { BreathingPhase } from "@respira/shared-types";
import { useEffect } from "react";
import { View } from "react-native";
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { isSkiaUsable } from "@/lib/skia-available";
import { useMotion } from "@/theme/use-motion";

// Statik import, Skia'sız platformlarda ekranı düşürüyor — bkz. ProgressRing.
const skia = isSkiaUsable()
  ? (require("@shopify/react-native-skia") as typeof import("@shopify/react-native-skia"))
  : null;

const MIN_R = 62;
const MAX_R = 108;
// Dış hale en fazla radius + 18 + 10 = MAX_R + 28'e kadar genişliyor (bkz.
// haloRadius aşağıda) — tuval bunu tam olarak karşılamazsa hale kenarlardan
// kırpılıp köşeli/kesik görünüyordu. SIZE bu üst sınırı + biraz pay içerir.
const HALO_MAX_R = MAX_R + 28;
const SIZE = HALO_MAX_R * 2 + 16;
const CENTER = SIZE / 2;

interface Props {
  /** docs/07 — seçilen tekniğin gerçek faz süreleri (inhale/hold/exhale). */
  phases: readonly BreathingPhase[];
  /** false iken daire dinlenme boyutunda durur (egzersiz başlamadan önceki önizleme). */
  running: boolean;
  accent: string;
  surface: string;
}

/**
 * docs/01 — Animasyon katmanı 2 (Skia imza görseli).
 * docs/07 kabul kriteri: "Nefes animasyonu, seçilen tekniğin gerçek ritmiyle
 * senkronize" — bu yüzden basit inhale/exhale yerine faz dizisinden
 * (inhale/hold/exhale, her biri kendi süresiyle) bir Reanimated dizisi
 * kuruluyor; tutma fazlarında daire mevcut boyutunda sabit kalıyor.
 *
 * Hareket azaltma açıkken daire sabit orta boyda kalır — animasyon yok, ama
 * görsel kaybolmaz (docs/01: "basit fade'e düşmeli").
 */
export function BreathingOrb({ phases, running, accent, surface }: Props) {
  const { reduced } = useMotion();
  const progress = useSharedValue(reduced ? 0.5 : 0);

  useEffect(() => {
    if (reduced) {
      progress.value = withTiming(0.5, { duration: 400 });
      return;
    }
    if (!running) {
      progress.value = withTiming(0, { duration: 400 });
      return;
    }

    // Faz dizisinden bir Reanimated withSequence kuruyoruz: inhale 0→1,
    // exhale 1→0, hold mevcut seviyede sabit kalır (aynı değere withTiming).
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

  const radius = useDerivedValue(() => MIN_R + (MAX_R - MIN_R) * progress.value);
  // Dış hale içteki daireden biraz gecikmeli genişliyor — organik his verir.
  const haloRadius = useDerivedValue(() => radius.value + 18 + 10 * progress.value);
  const haloOpacity = useDerivedValue(() => 0.1 + 0.16 * progress.value);

  if (!skia) {
    return <View style={{ width: SIZE, height: SIZE }} />;
  }

  const { Canvas, Circle, Group, RadialGradient, vec } = skia;

  return (
    <Canvas style={{ width: SIZE, height: SIZE }}>
      <Group>
        <Circle cx={CENTER} cy={CENTER} r={haloRadius} color={accent} opacity={haloOpacity} />
        <Circle cx={CENTER} cy={CENTER} r={radius}>
          <RadialGradient c={vec(CENTER, CENTER)} r={MAX_R} colors={[accent, surface]} />
        </Circle>
      </Group>
    </Canvas>
  );
}
