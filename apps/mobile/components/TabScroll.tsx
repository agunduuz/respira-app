import type { ReactNode } from "react";
import { ScrollView } from "react-native";

import { Screen } from "@/components/ui";
import { cn } from "@/theme/cn";

/**
 * Sekme ekranlarının ortak kabuğu: üst güvenli alan + kaydırma. Altta yüzen
 * kapsül gezinme çubuğu (74px + kenar boşluğu) içeriği örtmesin diye ~130px pay.
 */
export function TabScroll({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Screen edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName={cn("gap-[18px] px-[18px] pb-[130px] pt-3", className)}
      >
        {children}
      </ScrollView>
    </Screen>
  );
}
