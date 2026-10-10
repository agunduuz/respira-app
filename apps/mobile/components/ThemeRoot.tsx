import { vars } from "nativewind";
import { useMemo, type ReactNode } from "react";
import { View } from "react-native";

import { useHueStore } from "@/theme/hue-store";
import { themeVars } from "@/theme/tones";

/**
 * Seçili ana rengi (hue) tüm ağaca CSS değişkeni olarak uygular. Kullanıcı
 * Profil'den rengi değiştirince `bg-t300`, `text-mut` gibi tüm sınıflar bir
 * anda yeni renge geçer — ekranlar tek tek yeniden çizilmez.
 */
export function ThemeRoot({ children }: { children: ReactNode }) {
  const hue = useHueStore((s) => s.hue);
  const style = useMemo(() => vars(themeVars(hue)), [hue]);

  return <View style={[{ flex: 1 }, style]}>{children}</View>;
}
