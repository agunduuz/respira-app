import { ScrollView, View } from "react-native";

import { Button, Card, Screen, Text } from "@/components/ui";
import { useThemeStore } from "@/theme/theme-store";

/**
 * Tasarım sistemi doğrulama ekranı. docs/03 (göz yorgunluğu) geldiğinde
 * gerçek "Bugün" özetiyle değişecek — token'lar ve primitifler kalacak.
 */
export default function TodayScreen() {
  const { preference, setPreference } = useThemeStore();

  return (
    <Screen edges={["top"]}>
      <ScrollView contentContainerClassName="gap-6 p-4 pb-12">
        <View className="gap-1">
          <Text variant="label" muted>
            BUGÜN
          </Text>
          <Text variant="displayLg">Respira</Text>
        </View>

        {/* Sayaçlar display fontuyla — uygulamanın en sık bakılan öğeleri. */}
        <Card className="gap-2">
          <Text variant="label" muted>
            SU
          </Text>
          <View className="flex-row items-baseline gap-2">
            <Text variant="displayXl">1.4</Text>
            <Text variant="title" muted>
              / 2.5 L
            </Text>
          </View>
          <Text variant="data" muted>
            son kayıt 14:20
          </Text>
        </Card>

        <Card className="gap-3">
          <Text variant="title">Tema</Text>
          <Text variant="bodySm" muted>
            Koyu mod varsayılan. Açık mod ikinci seçenek olarak destekleniyor.
          </Text>
          <View className="flex-row gap-2">
            <Button
              title="Koyu"
              variant={preference === "dark" ? "primary" : "secondary"}
              onPress={() => setPreference("dark")}
              className="flex-1"
            />
            <Button
              title="Açık"
              variant={preference === "light" ? "primary" : "secondary"}
              onPress={() => setPreference("light")}
              className="flex-1"
            />
          </View>
        </Card>

        <Card className="gap-3">
          <Text variant="title">Bileşenler</Text>
          <Button title="Birincil aksiyon" />
          <Button title="İkincil aksiyon" variant="secondary" />
          <Button title="Metin aksiyonu" variant="ghost" />
          <Button title="Yükleniyor" loading />
          <Button title="Devre dışı" disabled />
        </Card>

        <Text variant="bodySm" muted>
          Bu uygulama bir sağlık hizmeti sağlamaz, yalnızca bir takip aracıdır.
        </Text>
      </ScrollView>
    </Screen>
  );
}
