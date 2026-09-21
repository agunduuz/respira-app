import { useState } from "react";
import { TextInput, View, type TextInputProps } from "react-native";

import { FieldLabel } from "@/components/nutrition/FieldLabel";
import { Text } from "@/components/ui";
import { cn } from "@/theme/cn";
import { touchTarget } from "@/theme/tokens";

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
        style={{ minHeight: touchTarget.min }}
        className={cn(
          "rounded-md border bg-surface px-4 font-body text-body text-text",
          error ? "border-danger" : focused ? "border-accent" : "border-border-strong",
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
