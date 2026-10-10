import { Pressable, View } from "react-native";

import { FieldLabel } from "@/components/nutrition/FieldLabel";
import { Icon, Text } from "@/components/ui";
import { cn } from "@/theme/cn";
import { touchTarget } from "@/theme/tokens";

export interface Choice<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  label: string;
  choices: readonly Choice<T>[];
  value: T | null;
  onChange: (v: T) => void;
  optional?: boolean;
}

/**
 * Çoktan seçmeli alan (Lavanta Blok hap seçici): seçili olan t900 dolgu + beyaz
 * metin, diğerleri çerçeveli beyaz. Radio semantiği veriliyor ki ekran okuyucu
 * seçili öğeyi doğru duyursun; dokunma hedefi 48dp tabanında.
 */
export function ChoiceGroup<T extends string>({ label, choices, value, onChange, optional }: Props<T>) {
  return (
    <View className="gap-2" accessibilityRole="radiogroup" accessibilityLabel={label}>
      <FieldLabel label={label} optional={optional} />
      <View className="flex-row flex-wrap gap-2">
        {choices.map((c) => {
          const selected = c.value === value;
          return (
            <Pressable
              key={c.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              aria-checked={selected}
              accessibilityLabel={c.label}
              onPress={() => onChange(c.value)}
              style={{ minHeight: touchTarget.min }}
              className={cn(
                "flex-row items-center justify-center gap-1.5 rounded-full border-[1.5px] px-4 active:scale-[0.96]",
                selected ? "border-t900 bg-t900" : "border-line bg-white"
              )}
            >
              {selected ? <Icon name="check" size={16} className="text-white" /> : null}
              <Text variant="subhead" className={selected ? "text-white" : "text-t900"}>
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
