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
      {hint ? (
        <Text variant="bodySm" muted>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
