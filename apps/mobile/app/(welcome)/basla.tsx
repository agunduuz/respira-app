import { router } from "expo-router";
import { Download, ShieldCheck, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

import { Button, Card, Screen, Text } from "@/components/ui";
import { useWelcomeStore } from "@/lib/welcome-store";
import { rgb, usePalette } from "@/theme/use-palette";

const POINTS = [
  { Icon: ShieldCheck, text: "Sağlık verilerin kimseyle paylaşılmaz, satılmaz." },
  { Icon: Download, text: "Verilerini istediğin an JSON olarak indirebilirsin." },
  { Icon: Trash2, text: "Hesabını sildiğinde tüm verilerin geri dönüşsüz silinir." },
] as const;

/** docs/01 → karşılama akışı 3/3: güven ekranı + giriş akışına geçiş. */
export default function WelcomeTrustScreen() {
  const palette = usePalette();
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    await useWelcomeStore.getState().markSeen();
    router.replace("/sign-in");
  }

  return (
    <Screen transparent edges={["bottom"]}>
      <View className="flex-1 justify-center gap-6 px-6">
        <View className="gap-2">
          <Text variant="displayLg">Verilerin sende kalır.</Text>
          <Text variant="body" muted>
            Ayrıntılı aydınlatma metnini ilk girişte okuyup onaylayacaksın — burada kısa özeti var.
          </Text>
        </View>

        <Card className="gap-4">
          {POINTS.map(({ Icon, text }) => (
            <View key={text} className="flex-row items-start gap-3">
              <Icon size={18} strokeWidth={1.75} color={rgb(palette.accent)} />
              <Text variant="bodySm" className="flex-1">
                {text}
              </Text>
            </View>
          ))}
        </Card>
      </View>

      <View className="gap-4 p-6">
        <Button title="Başla" onPress={start} loading={busy} />
      </View>
    </Screen>
  );
}
