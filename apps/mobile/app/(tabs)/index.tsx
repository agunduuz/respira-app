import { router } from "expo-router";
import { ChevronRight, Sun } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";

import { DailyChecklist } from "@/components/DailyChecklist";
import { HomeSlider } from "@/components/HomeSlider";
import { InfoTip } from "@/components/InfoTip";
import { Card, Screen, Text } from "@/components/ui";
import { DISCOVER_ITEMS, formatToday, greeting, type DiscoverItem } from "@/lib/discover";
import { EYE_TIPS, WATER_TIPS, tipOfTheDay } from "@/lib/tips";
import { touchTarget } from "@/theme/tokens";
import { rgb, usePalette } from "@/theme/use-palette";

const ALL_TIPS = [...EYE_TIPS, ...WATER_TIPS];

/**
 * Anasayfa. Bilinçli olarak tek bir eyleme zorlamıyor: selamlama, günün notu
 * ve göz atılabilir bir keşif şeridi var (docs/01 "Gezinme"). Modüllerin
 * durumu ve hızlı eylemler Bugün sekmesinde.
 */
export default function HomeScreen() {
  const palette = usePalette();

  return (
    <Screen edges={["top"]}>
      <ScrollView contentContainerClassName="gap-6 pb-12 pt-5">
        <View className="gap-1 px-5">
          <Text variant="label" muted>
            {formatToday().toLocaleUpperCase("tr-TR")}
          </Text>
          <Text variant="displayLg">{greeting()}</Text>
        </View>

        <HomeSlider />

        <DailyChecklist />

        <View className="px-5">
          <InfoTip text={tipOfTheDay(ALL_TIPS)} />
        </View>

        <View className="gap-3">
          <Text variant="title" className="px-5">
            Keşfet
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3 px-5"
          >
            {DISCOVER_ITEMS.map((item) => (
              <DiscoverCard key={item.id} item={item} />
            ))}
          </ScrollView>
        </View>

        <View className="px-5">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bugün sekmesine git"
            onPress={() => router.push("/bugun")}
            style={{ minHeight: touchTarget.min }}
          >
            {({ pressed }) => (
              <Card
                className="flex-row items-center gap-3"
                style={{ opacity: pressed ? 0.65 : 1 }}
              >
                <View
                  className="items-center justify-center rounded-full bg-accent/10"
                  style={{ width: 36, height: 36 }}
                >
                  <Sun size={18} strokeWidth={1.75} color={rgb(palette.accent)} />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text variant="subhead">Bugünün durumu</Text>
                  <Text variant="bodySm" muted>
                    Göz, su, duruş ve nefes tek ekranda.
                  </Text>
                </View>
                <ChevronRight size={18} strokeWidth={1.75} color={rgb(palette.textMuted)} />
              </Card>
            )}
          </Pressable>
        </View>

        <Text variant="bodySm" muted className="px-5">
          Bu uygulama bir sağlık hizmeti sağlamaz, yalnızca bir hatırlatma aracıdır.
        </Text>
      </ScrollView>
    </Screen>
  );
}

function DiscoverCard({ item }: { item: DiscoverItem }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.kicker}: ${item.title}`}
      onPress={() => router.push(item.href)}
      style={{ width: 248, height: 152 }}
    >
      {({ pressed }) => (
        <Card className="flex-1 gap-2" style={{ opacity: pressed ? 0.65 : 1 }}>
          <Text variant="label" className="text-accent">
            {item.kicker.toLocaleUpperCase("tr-TR")}
          </Text>
          <Text variant="subhead">{item.title}</Text>
          <Text variant="bodySm" muted>
            {item.body}
          </Text>
        </Card>
      )}
    </Pressable>
  );
}
