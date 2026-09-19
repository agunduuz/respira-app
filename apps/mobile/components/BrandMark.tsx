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

interface Props {
  color: string;
  size?: number;
  /** Karşılama akışında sürekli, nefes alır gibi bir pulse — sign-in'de statik. */
  animated?: boolean;
}

/**
 * Respira'nın nefes egzersizi halkalarına gönderme yapan sade marka işareti.
 * `BreathingOrb`'un Skia kurulumunu tekrarlamaya değmez — üç iç içe halkayla
 * aynı fikri hafif bir View kompozisyonuyla veriyoruz.
 */
export function BrandMark({ color, size = 72, animated = false }: Props) {
  const { reduced } = useMotion();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!animated || reduced) return;
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.96, { duration: 2200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [animated, reduced, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: animated && !reduced ? scale.value : 1 }],
  }));

  const midSize = size * (50 / 72);
  const coreSize = size * (28 / 72);

  return (
    <Animated.View
      style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}
    >
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1,
          borderColor: color,
          opacity: 0.18,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: midSize,
          height: midSize,
          borderRadius: midSize / 2,
          borderWidth: 1,
          borderColor: color,
          opacity: 0.35,
        }}
      />
      <View
        style={{
          width: coreSize,
          height: coreSize,
          borderRadius: coreSize / 2,
          backgroundColor: color,
        }}
      />
    </Animated.View>
  );
}
