import { Check } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { cn } from "@/theme/cn";
import { touchTarget } from "@/theme/tokens";
import { rgb, usePalette } from "@/theme/use-palette";
import { Text } from "./Text";

export interface CheckboxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

/**
 * docs/02: açık rıza "önceden işaretli olmayan bir checkbox" ile alınmalı.
 * Bu bileşenin varsayılan değeri yok — `checked` her zaman dışarıdan gelir,
 * böylece yanlışlıkla true başlatmak mümkün olmuyor.
 */
export function Checkbox({ checked, onChange, label, disabled, className }: CheckboxProps) {
  const { onAccent } = usePalette();

  return (
    <Pressable
      accessibilityRole="checkbox"
      // accessibilityState native tarafta, aria-checked web tarafında okunuyor —
      // react-native-web accessibilityState.checked'i aria-checked'e çevirmiyor.
      accessibilityState={{ checked, disabled: !!disabled }}
      aria-checked={checked}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={{ minHeight: touchTarget.min }}
      className={cn("flex-row items-center gap-3 py-2", disabled && "opacity-40", className)}
    >
      {({ pressed }) => (
        <>
          <View
            className={cn(
              "h-6 w-6 items-center justify-center rounded-sm border-2",
              checked ? "border-accent bg-accent" : "border-border-strong bg-transparent"
            )}
            style={{ opacity: pressed ? 0.65 : 1 }}
          >
            {checked ? <Check size={16} strokeWidth={3} color={rgb(onAccent)} /> : null}
          </View>
          <Text variant="bodySm" className="flex-1">
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
