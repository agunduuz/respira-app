import { router } from "expo-router";
import { Droplet, Eye, PersonStanding, type LucideIcon } from "lucide-react-native";
import { View } from "react-native";

import { Button, Card, Screen, Text } from "@/components/ui";
import { cn } from "@/theme/cn";
import { rgb, usePalette } from "@/theme/use-palette";

const BEFORE_AFTER: readonly { Icon: LucideIcon; before: string; after: string }[] = [
  { Icon: Eye, before: "Ekrana bakarken molayı unutuyorum", after: "Göz molası zamanı gelince hatırlatılıyorum" },
  { Icon: Droplet, before: "Gün bitince su içmediğimi fark ediyorum", after: "Su hedefimi gün içinde takip ediyorum" },
  { Icon: PersonStanding, before: "Omuzlarım ve belim tutuluyor", after: "Kısa duruş molalarıyla hareket ediyorum" },
];

/** docs/01 → karşılama akışı 2/3: önce / sonra kartı. Özellik listesi her sekmenin kendi tanıtımında. */
export default function WelcomeBeforeAfterScreen() {
  const palette = usePalette();

  return (
    <Screen transparent edges={["bottom"]}>
      <View className="flex-1 gap-6 px-6">
        <Text variant="displayLg">Günün daha sakin geçsin.</Text>

        <View className="gap-3">
          <Column
            title="Önce"
            items={BEFORE_AFTER.map(({ Icon, before }) => ({ Icon, text: before }))}
            iconColor={rgb(palette.textMuted)}
          />
          <Column
            title="Sonra"
            accent
            items={BEFORE_AFTER.map(({ Icon, after }) => ({ Icon, text: after }))}
            iconColor={rgb(palette.accent)}
          />
        </View>
      </View>

      <View className="gap-4 p-6">
        <Button title="İleri" onPress={() => router.replace("/(welcome)/basla")} />
      </View>
    </Screen>
  );
}

function Column({
  title,
  items,
  iconColor,
  accent,
}: {
  title: string;
  items: { Icon: LucideIcon; text: string }[];
  iconColor: string;
  accent?: boolean;
}) {
  return (
    <Card className={cn("gap-3", accent ? "border-accent bg-accent/10" : "bg-transparent")}>
      <Text variant="subhead" className={accent ? "text-accent" : "text-text-muted"}>
        {title}
      </Text>
      {items.map(({ Icon, text }) => (
        <View key={text} className="flex-row items-center gap-3">
          <Icon size={18} strokeWidth={1.75} color={iconColor} />
          <Text variant="bodySm" muted={!accent} className="flex-1">
            {text}
          </Text>
        </View>
      ))}
    </Card>
  );
}
