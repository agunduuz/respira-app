import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { isSkiaUsable } from "@/lib/skia-available";
import { useMotion } from "@/theme/use-motion";

// Statik import, Skia'sız platformlarda ekranı düşürüyor — bkz. ProgressRing.
const skia = isSkiaUsable()
  ? (require("@shopify/react-native-skia") as typeof import("@shopify/react-native-skia"))
  : null;

const WIDTH = 180;
const HEIGHT = 220;
const RADIUS = 22;

interface Props {
  /** 0-1 arası — günlük hedefe göre doluluk oranı. */
  ratio: number;
  accent: string;
  surface: string;
  trackColor: string;
}

/**
 * docs/06 → "doldurulan bir su bardağı/şişe animasyonu": konteyner + dalga
 * efekti, içilen miktar arttıkça yükselen sıvı seviyesi.
 *
 * Skia kullanılamayan platformlarda (bkz. skia-available.ts) işlev kaybolmaz,
 * yalnızca dalga süsü kaybolur: düz bir dolgu barı aynı oranı gösterir.
 *
 * `skia` modül yüklemesinde bir kez sabitlenip bir daha değişmiyor, bu yüzden
 * iki ayrı bileşene bölmek güvenli: her biri kendi hook'larını KOŞULSUZ
 * çağırıyor, Skia null olma ihtimaliyle tip/hook sırası çelişkisi oluşmuyor.
 */
export function WaterWave(props: Props) {
  return skia ? <SkiaWave {...props} /> : <FallbackWave {...props} />;
}

function FallbackWave({ ratio, accent, trackColor }: Props) {
  const clamped = Math.min(1, Math.max(0, ratio));
  const level = useSharedValue(0);

  useEffect(() => {
    level.value = withTiming(clamped, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [clamped, level]);

  const fallbackStyle = useAnimatedStyle(() => ({
    height: `${level.value * 100}%`,
  }));

  return (
    <View
      style={{
        width: WIDTH,
        height: HEIGHT,
        borderRadius: RADIUS,
        borderWidth: 2,
        borderColor: trackColor,
        overflow: "hidden",
        justifyContent: "flex-end",
      }}
    >
      <Animated.View style={[{ backgroundColor: accent, width: "100%" }, fallbackStyle]} />
    </View>
  );
}

function SkiaWave({ ratio, accent, surface, trackColor }: Props) {
  const { Canvas, Group, Path, RoundedRect, LinearGradient, Skia, vec } = skia!;

  const { reduced } = useMotion();
  const clamped = Math.min(1, Math.max(0, ratio));

  const level = useSharedValue(0);
  const phase = useSharedValue(0);

  useEffect(() => {
    level.value = withTiming(clamped, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [clamped, level]);

  useEffect(() => {
    if (reduced) {
      phase.value = 0;
      return;
    }
    phase.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.linear }), -1, false);
  }, [reduced, phase]);

  // Dalga yüzeyi her karede yeniden çiziliyor — genlik hareket azaltma
  // açıkken 0'a düşer, seviye sabit ama süsleme kaybolmaz.
  const wavePath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const waterY = HEIGHT - HEIGHT * level.value;
    const amplitude = reduced ? 0 : 5;
    const waveLength = WIDTH / 1.4;
    const shift = phase.value * Math.PI * 2;

    path.moveTo(0, waterY);
    for (let x = 0; x <= WIDTH; x += 6) {
      const y = waterY + Math.sin((x / waveLength) * Math.PI * 2 + shift) * amplitude;
      path.lineTo(x, y);
    }
    path.lineTo(WIDTH, HEIGHT);
    path.lineTo(0, HEIGHT);
    path.close();
    return path;
  });

  const rrect = Skia.RRectXY(Skia.XYWHRect(0, 0, WIDTH, HEIGHT), RADIUS, RADIUS);

  return (
    <Canvas style={{ width: WIDTH, height: HEIGHT }}>
      <RoundedRect
        x={1}
        y={1}
        width={WIDTH - 2}
        height={HEIGHT - 2}
        r={RADIUS}
        style="stroke"
        strokeWidth={2}
        color={trackColor}
      />
      <Group clip={rrect}>
        <Path path={wavePath}>
          <LinearGradient start={vec(0, 0)} end={vec(0, HEIGHT)} colors={[accent, surface]} />
        </Path>
      </Group>
    </Canvas>
  );
}
