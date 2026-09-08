import { View } from "react-native";

import { BreathingOrb } from "@/components/BreathingOrb";
import { Screen, Text } from "@/components/ui";
import { useThemeStore } from "@/theme/theme-store";
import { darkPalette, lightPalette } from "@/theme/tokens";
import { useMotion } from "@/theme/use-motion";

export default function BreathScreen() {
  const preference = useThemeStore((s) => s.preference);
  const palette = preference === "light" ? lightPalette : darkPalette;
  const rgb = (c: string) => `rgb(${c.split(" ").join(", ")})`;
  const { reduced } = useMotion();

  return (
    <Screen edges={["top"]} className="items-center justify-center gap-8 p-6">
      <View className="items-center gap-2">
        <Text variant="label" muted>
          NEFES
        </Text>
        <Text variant="displayLg">4 · 4</Text>
      </View>

      <BreathingOrb accent={rgb(palette.accent)} surface={rgb(palette.surface)} />

      <Text variant="bodySm" muted className="text-center">
        {reduced
          ? "Hareket azaltma açık — daire sabit gösteriliyor."
          : "Daire genişlerken nefes al, daralırken ver."}
      </Text>

      <Text variant="bodySm" muted className="text-center">
        Bu öneriler doktor desteğinin yerine geçmez.
      </Text>
    </Screen>
  );
}
