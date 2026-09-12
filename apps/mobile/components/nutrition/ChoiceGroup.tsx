import { Pressable, View } from "react-native";

import { Text } from "@/components/ui";
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
 * Çoktan seçmeli alan. Radio semantiği veriliyor ki ekran okuyucu seçili
 * öğeyi doğru duyursun; dokunma hedefi 48dp tabanında.
 */
export function ChoiceGroup<T extends string>({
  label,
  choices,
  value,
  onChange,
  optional,
}: Props<T>) {
  return (
    <View className="gap-2" accessibilityRole="radiogroup" accessibilityLabel={label}>
      <View className="flex-row items-baseline gap-2">
        <Text variant="label" muted>
          {label.toLocaleUpperCase("tr-TR")}
        </Text>
        {optional ? (
          <Text variant="label" muted>
            opsiyonel
          </Text>
        ) : null}
      </View>
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
                "items-center justify-center rounded-md border px-4",
                selected ? "border-accent bg-accent" : "border-border-strong bg-surface"
              )}
            >
              {({ pressed }) => (
                <Text
                  variant="label"
                  className={selected ? "text-on-accent" : "text-text"}
                  style={{ opacity: pressed ? 0.65 : 1 }}
                >
                  {c.label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
