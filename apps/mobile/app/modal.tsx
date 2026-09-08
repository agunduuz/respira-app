import { ScrollView } from "react-native";

import { Card, Screen, Text } from "@/components/ui";

export default function ModalScreen() {
  return (
    <Screen edges={["bottom"]}>
      <ScrollView contentContainerClassName="gap-4 p-4">
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
      </ScrollView>
    </Screen>
  );
}
