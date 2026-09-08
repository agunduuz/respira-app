import { Canvas, Circle, Group, RadialGradient, vec } from "@shopify/react-native-skia";
import { useEffect } from "react";
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useMotion } from "@/theme/use-motion";

const SIZE = 260;
const CENTER = SIZE / 2;
const MIN_R = 62;
const MAX_R = 108;

interface Props {
  /** Nefes alma süresi (ms). Dışarı verme aynı süre alır. */
  inhaleMs?: number;
  accent: string;
  surface: string;
}

/**
 * docs/01 — Animasyon katmanı 2 (Skia imza görseli).
 * Nefes egzersizinin genişleyip daralan dairesi. Kasıtlı olarak tek bir güçlü
 * hareket: "cesaretini tek bir yerde harca".
 *
 * Hareket azaltma açıkken daire sabit orta boyda kalır — animasyon yok, ama
 * görsel kaybolmaz (docs/01: "basit fade'e düşmeli").
 */
export function BreathingOrb({ inhaleMs = 4000, accent, surface }: Props) {
  const { reduced } = useMotion();
  const progress = useSharedValue(reduced ? 0.5 : 0);

  useEffect(() => {
    if (reduced) {
      progress.value = 0.5;
      return;
    }
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: inhaleMs, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: inhaleMs, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [reduced, inhaleMs, progress]);

  const radius = useDerivedValue(() => MIN_R + (MAX_R - MIN_R) * progress.value);
  // Dış hale içteki daireden biraz gecikmeli genişliyor — organik his verir.
  const haloRadius = useDerivedValue(() => radius.value + 18 + 10 * progress.value);
  const haloOpacity = useDerivedValue(() => 0.10 + 0.16 * progress.value);

  return (
    <Canvas style={{ width: SIZE, height: SIZE }}>
      <Group>
        <Circle cx={CENTER} cy={CENTER} r={haloRadius} color={accent} opacity={haloOpacity} />
        <Circle cx={CENTER} cy={CENTER} r={radius}>
          <RadialGradient
            c={vec(CENTER, CENTER)}
            r={MAX_R}
            colors={[accent, surface]}
          />
        </Circle>
      </Group>
    </Canvas>
  );
}
