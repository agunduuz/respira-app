import { Text as RNText, type TextStyle } from "react-native";

import { cn } from "@/theme/cn";
import { fontFamily } from "@/theme/tokens";

export interface IconProps {
  /** Material Symbols Rounded ligatür adı: "home", "water_drop", "arrow_back"… */
  name: string;
  size?: number;
  /** Renk sınıfı: "text-t900", "text-white"… Varsayılan metin rengi. */
  className?: string;
  style?: TextStyle;
}

/**
 * Lavanta Blok tasarımındaki ikon seti (Material Symbols Rounded). Font
 * ligatürüyle çizilir; dekoratif olduğu için erişilebilirlik ağacından gizli —
 * anlamı taşıyan ikonlar üst Pressable'ın accessibilityLabel'ıyla adlandırılır.
 */
export function Icon({ name, size = 24, className, style }: IconProps) {
  return (
    <RNText
      accessibilityElementsHidden
      importantForAccessibility="no"
      allowFontScaling={false}
      selectable={false}
      className={cn("text-text", className)}
      style={[{ fontFamily: fontFamily.icon, fontSize: size, lineHeight: size }, style]}
    >
      {name}
    </RNText>
  );
}
