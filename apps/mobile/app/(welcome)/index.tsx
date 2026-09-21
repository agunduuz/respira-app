import { router } from "expo-router";
import { View } from "react-native";

import { BrandMark } from "@/components/BrandMark";
import { Button, Screen, Text } from "@/components/ui";
import { rgb, usePalette } from "@/theme/use-palette";

/**
 * docs/01 → karşılama akışı 1/3: hero. Auth'tan önce, uygulamanın ne
 * olduğunu tek cümleyle anlatır. AuthGate, oturumsuz ve hasSeenWelcome=false
 * olan kullanıcıyı buraya yönlendirir (bkz. components/AuthGate.tsx).
 */
export default function WelcomeHeroScreen() {
  const palette = usePalette();

  return (
    <Screen transparent edges={["bottom"]}>
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
        <Button title="İleri" onPress={() => router.replace("/(welcome)/ozellikler")} />
      </View>
    </Screen>
  );
}
