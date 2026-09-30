import { FOOD_TABLE_SOURCES } from "@respira/shared-types";
import { ScrollView, View } from "react-native";

import { Card, Screen, Text } from "@/components/ui";

export default function ModalScreen() {
  return (
    <Screen edges={["bottom"]}>
      <ScrollView contentContainerClassName="gap-4 p-5">
        <Text variant="title">Respira hakkında</Text>
        <Card className="gap-2">
          <Text variant="body">
            Respira bir takip aracıdır; tanı koymaz, tedavi önermez.
          </Text>
          <Text variant="bodySm" muted>
            Sağlık verilerin cihazında ve hesabına bağlı olarak saklanır.
            Ayarlardan dilediğin zaman dışa aktarabilir veya silebilirsin.
          </Text>
        </Card>

        {/* Besin değeri tablosunun kaynakları atıf gerektiriyor (IDEA-008). */}
        <Card className="gap-2">
          <Text variant="subhead">Besin değeri kaynakları</Text>
          <View className="gap-1.5">
            {FOOD_TABLE_SOURCES.map((source) => (
              <Text key={source} variant="bodySm" muted>
                {source}
              </Text>
            ))}
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}
