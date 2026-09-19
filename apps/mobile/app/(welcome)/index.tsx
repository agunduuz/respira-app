import { router } from "expo-router";
import { Pressable, View } from "react-native";

import { BrandMark } from "@/components/BrandMark";
import { StepDots } from "@/components/StepDots";
import { Button, Screen, Text } from "@/components/ui";
import { useWelcomeStore } from "@/lib/welcome-store";
import { useThemeStore } from "@/theme/theme-store";
import { darkPalette, lightPalette } from "@/theme/tokens";

/**
 * docs/01 → karşılama akışı 1/3: hero. Auth'tan önce, uygulamanın ne
 * olduğunu tek cümleyle anlatır. AuthGate, oturumsuz ve hasSeenWelcome=false
 * olan kullanıcıyı buraya yönlendirir (bkz. components/AuthGate.tsx).
 */
export default function WelcomeHeroScreen() {
  const preference = useThemeStore((s) => s.preference);
  const palette = preference === "light" ? lightPalette : darkPalette;
  const rgb = (c: string) => `rgb(${c.split(" ").join(", ")})`;

  async function skip() {
    await useWelcomeStore.getState().markSeen();
    router.replace("/sign-in");
  }

  return (
    <Screen>
      <View className="flex-row justify-end p-4">
        <Pressable onPress={skip} accessibilityRole="button" hitSlop={8} className="px-2 py-1">
          <Text variant="label" muted>
            Atla
          </Text>
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center gap-6 px-8">
        <BrandMark color={rgb(palette.accent)} size={96} animated />
        <View className="items-center gap-2">
          <Text variant="displayXl" className="text-center">
            Respira
          </Text>
          <Text variant="title" muted className="text-center">
            Ekranın seni yormasın.
          </Text>
        </View>
        <Text variant="body" muted className="text-center">
          Göz, beslenme, su, duruş ve stres — günün boyunca sessizce yanında.
        </Text>
      </View>

      <View className="gap-4 p-6">
        <StepDots total={3} current={1} color={rgb(palette.accent)} trackColor={rgb(palette.border)} />
        <Button title="İleri" onPress={() => router.replace("/(welcome)/ozellikler")} />
      </View>
    </Screen>
  );
}
