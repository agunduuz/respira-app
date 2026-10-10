import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedProps, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

import { motion } from "@/theme/tokens";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface RingSpec {
  /** Yarıçap (svg birimi). */
  r: number;
  /** 0–1 arası doluluk; aşımlar 1'e kırpılır. */
  value: number;
  /** Dolgu rengi (rgb string). */
  color: string;
}

export interface RingsProps {
  size: number;
  strokeWidth: number;
  trackColor: string;
  rings: readonly RingSpec[];
  children?: React.ReactNode;
}

/**
 * Lavanta Blok halkaları: iç içe, 12 yönünden başlayıp saat yönünde dolan,
 * yuvarlak uçlu halkalar. Değer değişince .5s'de akarak dolar/boşalır.
 * Ortaya `children` yerleştirilir (sayaç metni Text olarak kalsın, ölçeklensin).
 */
export function Rings({ size, strokeWidth, trackColor, rings, children }: RingsProps) {
  const c = size / 2;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: [{ rotate: "-90deg" }] }}>
        {rings.map((ring, i) => (
          <Circle key={`t${i}`} cx={c} cy={c} r={ring.r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        ))}
        {rings.map((ring, i) => (
          <Arc key={`a${i}`} cx={c} cy={c} spec={ring} strokeWidth={strokeWidth} />
        ))}
      </Svg>
      {children ? (
        <View style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }}>
          {children}
        </View>
      ) : null}
    </View>
  );
}

function Arc({ cx, cy, spec, strokeWidth }: { cx: number; cy: number; spec: RingSpec; strokeWidth: number }) {
  const circumference = 2 * Math.PI * spec.r;
  const target = Math.min(1, Math.max(0, spec.value));
  const progress = useSharedValue(target);

  useEffect(() => {
    progress.value = withTiming(target, { duration: motion.standard });
  }, [target, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDasharray: [circumference * progress.value, circumference],
  }));

  return (
    <AnimatedCircle
      cx={cx}
      cy={cy}
      r={spec.r}
      fill="none"
      stroke={spec.color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      // Değer 0 iken yuvarlak uç "nokta" olarak görünmesin.
      opacity={target <= 0.001 ? 0 : 1}
      animatedProps={animatedProps}
    />
  );
}
