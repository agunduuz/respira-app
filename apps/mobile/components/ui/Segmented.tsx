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

/**
 * Hap seçici (Gün/Hafta/Ay): t50 zemin üstünde seçili olan t900 dolgu + beyaz
 * metin. Eski çağrılarla aynı API.
 */
export function Segmented<T extends string>({ options, value, onChange, className }: SegmentedProps<T>) {
  return (
    <View className={cn("flex-row gap-0.5 rounded-[18px] bg-t50 p-1", className)} accessibilityRole="tablist">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={{ minHeight: touchTarget.min - 8 }}
            className={cn("flex-1 items-center justify-center rounded-[14px] px-3", active ? "bg-t900" : "bg-transparent")}
          >
            <Text variant="label" className={active ? "text-white" : "text-mut"}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
