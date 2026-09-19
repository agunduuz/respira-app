import { router } from "expo-router";
import { Droplet, Eye, PersonStanding, UtensilsCrossed, Wind } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { StepDots } from "@/components/StepDots";
import { Button, Card, Screen, Text } from "@/components/ui";
import { useWelcomeStore } from "@/lib/welcome-store";
import { useThemeStore } from "@/theme/theme-store";
import { darkPalette, lightPalette } from "@/theme/tokens";

const FEATURES = [
  { Icon: Eye, title: "Göz molası", body: "20-20-20 kuralıyla ekran yorgunluğunu azalt." },
  { Icon: UtensilsCrossed, title: "Beslenme", body: "Öğünlerini kaydet, makrolarını takip et." },
  { Icon: Droplet, title: "Su", body: "Günlük su hedefini kolayca tut." },
  { Icon: PersonStanding, title: "Duruş", body: "Düzenli aralıklarla duruşunu hatırlat." },
  { Icon: Wind, title: "Nefes & Stres", body: "Kısa nefes egzersizleriyle sakinleş." },
] as const;

/** docs/01 → karşılama akışı 2/3: beş modülün tek satırlık özeti. */
export default function WelcomeFeaturesScreen() {
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

      <View className="flex-1 gap-6 px-6">
        <Text variant="displayLg">Beş alışkanlık, tek yer.</Text>

        <Card className="gap-1">
          {FEATURES.map(({ Icon, title, body }, i) => (
            <View
              key={title}
              className={
                "flex-row items-center gap-4 py-3" + (i > 0 ? " border-t border-border" : "")
              }
            >
              <View
                className="items-center justify-center rounded-full bg-elevated"
                style={{ width: 40, height: 40 }}
              >
                <Icon size={20} strokeWidth={1.75} color={rgb(palette.accent)} />
              </View>
              <View className="flex-1 gap-0.5">
                <Text variant="label">{title}</Text>
                <Text variant="bodySm" muted>
                  {body}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      </View>

      <View className="gap-4 p-6">
        <StepDots total={3} current={2} color={rgb(palette.accent)} trackColor={rgb(palette.border)} />
        <Button title="İleri" onPress={() => router.replace("/(welcome)/basla")} />
      </View>
    </Screen>
  );
}
