import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { cn } from "@/theme/cn";
import { useMotion } from "@/theme/use-motion";

interface Props {
  /** 1'den başlayan mevcut adım. */
  current: number;
  total: number;
  className?: string;
}

/**
 * Çok adımlı akışların üstündeki ince, segmentli ilerleme çubuğu. Her adım bir
 * segment olduğu için kullanıcı kaç adım kaldığını tek bakışta görür — bu da
 * akışları kısa tutmayı zorunlu kılar (docs/01 "Çok adımlı akışlar").
 */
export function FlowProgress({ current, total, className }: Props) {
  const label = `Adım ${current} / ${total}`;

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 1, max: total, now: current, text: label }}
      className={cn("flex-row gap-1", className)}
    >
      {Array.from({ length: total }, (_, i) => (
        <Segment key={i} filled={i < current} />
      ))}
    </View>
  );
}

function Segment({ filled }: { filled: boolean }) {
  const { duration } = useMotion();
  const fill = useSharedValue(filled ? 1 : 0);

  useEffect(() => {
    fill.value = withTiming(filled ? 1 : 0, { duration: duration.standard });
  }, [filled, fill, duration.standard]);

  const style = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));

  return (
    <View className="h-[6px] flex-1 overflow-hidden rounded-full bg-line">
      <Animated.View style={[{ height: "100%" }, style]}>
        <View className="flex-1 rounded-full bg-t900" />
      </Animated.View>
    </View>
  );
}
