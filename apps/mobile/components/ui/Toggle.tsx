import { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { cn } from "@/theme/cn";
import { motion } from "@/theme/tokens";

export interface ToggleProps {
  value: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}

/** Tasarımdaki 52×30 anahtar: açıkken t900 zemin, beyaz yuvarlak sağa kayar (.2s). */
export function Toggle({ value, onChange, label, disabled }: ToggleProps) {
  const x = useSharedValue(value ? 22 : 0);

  useEffect(() => {
    x.value = withTiming(value ? 22 : 0, { duration: motion.micro });
  }, [value, x]);

  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onChange(!value)}
      hitSlop={10}
      className={cn("h-[30px] w-[52px] rounded-full p-[3px]", value ? "bg-t900" : "bg-line", disabled && "opacity-40")}
    >
      <Animated.View style={[{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#FFFFFF" }, knob]} />
    </Pressable>
  );
}
