import { useState } from "react";
import { TextInput, View, type TextInputProps } from "react-native";

import { FieldLabel } from "@/components/nutrition/FieldLabel";
import { Text } from "@/components/ui";
import { cn } from "@/theme/cn";

interface Props extends TextInputProps {
  label: string;
  hint?: string;
  /** docs/04: opsiyonel alanlar açıkça işaretlenmeli (veri asgarileştirmesi). */
  optional?: boolean;
  error?: string | null;
}

export function Field({ label, hint, optional, error, className, onFocus, onBlur, ...rest }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="gap-2">
      <FieldLabel label={label} optional={optional} />
      <TextInput
        accessibilityLabel={label}
        style={{ minHeight: 52 }}
        placeholderTextColor="#8B8A98"
        className={cn(
          "rounded-[22px] border-[1.5px] bg-white px-5 font-bodySemiBold text-body text-t900",
          error ? "border-danger" : focused ? "border-t900" : "border-line",
          className
        )}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {hint ? (
        <Text variant="bodySm" muted>
          {hint}
        </Text>
      ) : null}
      {error ? (
        <Text variant="bodySm" className="text-danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
