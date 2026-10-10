import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { cn } from "@/theme/cn";

export type TextVariant =
  | "numHero"
  | "displayXl"
  | "displayLg"
  | "headline"
  | "section"
  | "title"
  | "body"
  | "bodySm"
  | "subhead"
  | "button"
  | "label"
  | "caption"
  | "data";

/**
 * Tipografi ölçeğini tek yerde tutan metin bileşeni (Urbanist). Büyük rakam ve
 * başlıklar 800–900 ağırlık + hafif negatif harf aralığı (tasarımdaki
 * letter-spacing -.02em). `data` rakamları hizalı tutmak için tabular.
 */
const variantClass: Record<TextVariant, string> = {
  numHero: "font-black text-num-hero tracking-tighter",
  displayXl: "font-black text-display-xl tracking-tight",
  displayLg: "font-black text-display-lg tracking-tight",
  headline: "font-black text-headline tracking-tight",
  section: "font-black text-section tracking-tight",
  title: "font-heavy text-title",
  body: "font-body text-body",
  bodySm: "font-body text-body-sm",
  subhead: "font-bodySemiBold text-subhead",
  button: "font-heavy text-button",
  label: "font-bodySemiBold text-label",
  caption: "font-bodySemiBold text-caption",
  data: "font-data text-data",
};

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  /** İkincil metin rengi (`mut`). */
  muted?: boolean;
  className?: string;
}

export function Text({ variant = "body", muted = false, className, style, ...rest }: TextProps) {
  return (
    <RNText
      className={cn(variantClass[variant], muted ? "text-text-muted" : "text-text", className)}
      style={variant === "data" || variant === "numHero" ? [{ fontVariant: ["tabular-nums"] }, style] : style}
      {...rest}
    />
  );
}
