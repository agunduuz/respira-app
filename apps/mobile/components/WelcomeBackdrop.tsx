import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { useIsDark } from "@/theme/theme-store";
import { usePalette } from "@/theme/use-palette";

const rgba = (c: string, a: number) => `rgba(${c.split(" ").join(", ")}, ${a})`;

interface Props {
  /** Karşılama akışındaki sıra (0, 1, 2). */
  step: number;
}

/**
 * Karşılama akışının arka planı: her adım için bir gradyan katmanı, adım
 * değişince katmanlar birbirine yumuşakça karışır. Renkler mevcut paletten
 * (accent / warm) gelir ve düşük opaklıkta tutulur — metin kontrastı bozulmaz.
 */
export function WelcomeBackdrop({ step }: Props) {
  const palette = usePalette();
  const alpha = useIsDark() ? 0.5 : 0.55;

  const layers = [palette.t200, palette.t300, palette.t100];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" className="bg-bg">
      {layers.map((color, i) => (
        <Layer key={i} active={step === i} color={color} alpha={alpha} flip={i === 2} bg={palette.bg} />
      ))}
    </View>
  );
}

function Layer({ active, color, alpha, flip, bg }: { active: boolean; color: string; alpha: number; flip: boolean; bg: string }) {
  const opacity = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    opacity.value = withTiming(active ? 1 : 0, { duration: 700, easing: Easing.inOut(Easing.cubic) });
  }, [active, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <LinearGradient
        colors={[rgba(color, alpha), rgba(bg, 0)]}
        start={flip ? { x: 0.1, y: 1 } : { x: 0.9, y: 0 }}
        end={flip ? { x: 0.9, y: 0 } : { x: 0.1, y: 0.9 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}
