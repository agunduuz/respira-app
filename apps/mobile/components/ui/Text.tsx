import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { cn } from "@/theme/cn";

export type TextVariant =
  | "displayXl"
  | "displayLg"
  | "title"
  | "body"
  | "bodySm"
  | "label"
  | "data";

/**
 * Tipografi ölçeğini tek yerde tutan metin bileşeni.
 * `data` varyantı tabular mono — grafik/sayaç rakamları hizalı dursun diye.
 */
const variantClass: Record<TextVariant, string> = {
  displayXl: "font-displayBold text-display-xl",
  displayLg: "font-display text-display-lg",
  title: "font-display text-title",
  body: "font-body text-body",
  bodySm: "font-body text-body-sm",
  label: "font-bodyMedium text-label",
  data: "font-data text-data",
};

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  muted?: boolean;
  className?: string;
}

export function Text({ variant = "body", muted = false, className, ...rest }: TextProps) {
  return (
    <RNText
      className={cn(variantClass[variant], muted ? "text-text-muted" : "text-text", className)}
      {...rest}
    />
  );
}
