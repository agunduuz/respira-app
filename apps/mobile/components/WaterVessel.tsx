import { useEffect, useState } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { rgb, usePalette } from "@/theme/use-palette";
import { useMotion } from "@/theme/use-motion";

export interface WaterVesselProps {
  /** 0–1: günlük hedefe göre doluluk. */
  ratio: number;
  /** 0–1: şu ana kadar içilmesi gereken seviye (kesikli çizgi). */
  expected: number;
  height?: number;
  width?: number;
}

/**
 * Lavanta Blok su kabı: hap biçimli (yarıçap = genişlik/2) t50 kap, içinde iki
 * katman dönen yuvarlatılmış dev blok (t200 arka, t400 ön) — üstleri dalga gibi
 * dalgalanır. Seviye .: 1.2s'de akarak yükselir. Skia gerektirmez.
 * Kesikli t900 çizgi "şu ana kadar içmen gereken" seviyeyi gösterir.
 */
export function WaterVessel({ ratio, expected, width = 150, height = 360 }: WaterVesselProps) {
  const palette = usePalette();
  const { reduced } = useMotion();
  const [w, setW] = useState(width);
  const level = useSharedValue(Math.min(1, Math.max(0, ratio)));

  useEffect(() => {
    level.value = withTiming(Math.min(1, Math.max(0, ratio)), {
      duration: reduced ? 0 : 1200,
      easing: Easing.bezier(0.3, 0.7, 0.3, 1),
    });
  }, [ratio, reduced, level]);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Su seviyesi"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(Math.min(1, ratio) * 100) }}
      onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}
      style={{ width, height, borderRadius: width / 2, overflow: "hidden", backgroundColor: rgb(palette.t50) }}
    >
      <Blob level={level} w={w} h={height} color={rgb(palette.t200)} seconds={12} offset={8} reduced={reduced} />
      <Blob level={level} w={w} h={height} color={rgb(palette.t400)} seconds={7} offset={0} reduced={reduced} />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: `${Math.min(1, Math.max(0, expected)) * 100}%`,
          borderTopWidth: 2.5,
          borderStyle: "dashed",
          borderColor: rgb(palette.t900),
          zIndex: 2,
        }}
      />
    </View>
  );
}

function Blob({
  level,
  w,
  h,
  color,
  seconds,
  offset,
  reduced,
}: {
  level: { value: number };
  w: number;
  h: number;
  color: string;
  seconds: number;
  offset: number;
  reduced: boolean;
}) {
  const size = w * 3.2;
  const spin = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      cancelAnimation(spin);
      return;
    }
    spin.value = withRepeat(withTiming(360, { duration: seconds * 1000, easing: Easing.linear }), -1);
    return () => cancelAnimation(spin);
  }, [reduced, seconds, spin]);

  const style = useAnimatedStyle(() => ({
    top: (1 - level.value) * h - offset,
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: -w * 1.1,
          width: size,
          height: size,
          borderRadius: size * 0.44,
          backgroundColor: color,
          zIndex: 1,
        },
        style,
      ]}
    />
  );
}
