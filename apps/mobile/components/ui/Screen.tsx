import { View, type ViewProps } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { cn } from "@/theme/cn";

export interface ScreenProps extends ViewProps {
  /** Hangi kenarlarda güvenli alan payı bırakılacağı. */
  edges?: readonly Edge[];
  className?: string;
  /** Arka planı şeffaf bırakır; ekranın arkasında üst düzey bir gradyan olduğunda kullanılır. */
  transparent?: boolean;
}

/**
 * Ekran kabuğu. pro-rules "Safe-area compliance": sabit başlık, tab bar ve CTA
 * çubukları çentik/durum çubuğu/gesture alanının altında kalmamalı.
 */
export function Screen({ edges = ["top", "bottom"], className, transparent, children, ...rest }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} className={cn("flex-1", !transparent && "bg-bg")}>
      <View className={cn("flex-1", className)} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}
