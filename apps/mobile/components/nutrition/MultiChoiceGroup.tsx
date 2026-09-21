import { Check } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { FieldLabel } from "@/components/nutrition/FieldLabel";
import { Text } from "@/components/ui";
import { cn } from "@/theme/cn";
import { touchTarget } from "@/theme/tokens";
import { rgb, usePalette } from "@/theme/use-palette";

export interface Choice<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  label: string;
  choices: readonly Choice<T>[];
  value: readonly T[];
  onChange: (next: T[]) => void;
  optional?: boolean;
  hint?: string;
}

/**
 * ChoiceGroup'un çoklu seçim hâli — tek bir alanda birden fazla değer
 * seçilebildiği yerler için (ör. birden fazla antrenman türü yapan biri).
 * Görsel olarak ChoiceGroup ile aynı dil, ama radyo değil checkbox semantiği.
 */
export function MultiChoiceGroup<T extends string>({
  label,
  choices,
  value,
  onChange,
  optional,
  hint,
}: Props<T>) {
  const palette = usePalette();

  function toggle(v: T) {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  }

  return (
    <View className="gap-2" accessibilityLabel={label}>
      <FieldLabel label={label} optional={optional} />
      <View className="flex-row flex-wrap gap-2">
        {choices.map((c) => {
          const selected = value.includes(c.value);
          return (
            <Pressable
              key={c.value}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={c.label}
              onPress={() => toggle(c.value)}
              style={{ minHeight: touchTarget.min }}
              className={cn(
                "flex-row items-center justify-center gap-1.5 rounded-full border px-4",
                selected ? "border-accent bg-accent/10" : "border-transparent bg-text/5"
              )}
            >
              {({ pressed }) => (
                <View
                  className="flex-row items-center gap-1.5"
                  style={{ transform: [{ scale: pressed ? 0.96 : 1 }] }}
                >
                  {selected ? <Check size={14} strokeWidth={2.5} color={rgb(palette.accent)} /> : null}
                  <Text variant="subhead" className={selected ? "text-accent" : "text-text"}>
                    {c.label}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
      {hint ? (
        <Text variant="bodySm" muted>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
