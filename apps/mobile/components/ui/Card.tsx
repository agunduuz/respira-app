import { View, type ViewProps } from "react-native";

import { cn } from "@/theme/cn";

/** Blok tonu — tailwind statik sınıf görmek zorunda, bu yüzden harita. */
export type Tone = "white" | "t25" | "t50" | "t100" | "t200" | "t300" | "t400" | "t900";

export const toneBg: Record<Tone, string> = {
  white: "bg-white",
  t25: "bg-t25",
  t50: "bg-t50",
  t100: "bg-t100",
  t200: "bg-t200",
  t300: "bg-t300",
  t400: "bg-t400",
  t900: "bg-t900",
};

export interface CardProps extends ViewProps {
  /** Blok rengi — Lavanta Blok'ta her modül kendi tonunda bir blok alır. */
  tone?: Tone;
  /** Eski çağrılarla uyum: modal/öne çıkan içerik için hafif renkli yüzey. */
  elevated?: boolean;
  className?: string;
}

/**
 * Blok kart: 26px köşe, ince çizgi yok (renk bloğu sınırı çiziyor). Koyu (t900)
 * blokta metin rengi bileşenin çocuklarına bırakılır.
 */
export function Card({ tone, elevated = false, className, ...rest }: CardProps) {
  return (
    <View
      className={cn("rounded-card p-5", toneBg[tone ?? (elevated ? "t50" : "white")], className)}
      {...rest}
    />
  );
}
