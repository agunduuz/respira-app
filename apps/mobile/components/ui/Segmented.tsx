import { Pressable, View } from "react-native";

import { cn } from "@/theme/cn";
import { touchTarget } from "@/theme/tokens";
import { Text } from "./Text";

interface Option<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedProps<T extends string> {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** Hap şeklinde sekme seçici — auth ekranındaki Giriş/Kayıt seçiciyle aynı kalıp. */
export function Segmented<T extends string>({ options, value, onChange, className }: SegmentedProps<T>) {
  return (
    <View className={cn("flex-row rounded-full border border-border bg-surface p-1", className)} accessibilityRole="tablist">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={{ minHeight: touchTarget.min - 8 }}
            className={cn("flex-1 items-center justify-center rounded-full", active ? "bg-accent" : "bg-transparent")}
          >
            <Text variant="label" className={active ? "text-on-accent" : "text-text-muted"}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
