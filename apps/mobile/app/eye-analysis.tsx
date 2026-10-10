import { ScrollView, View } from "react-native";

import { EyeCompliance } from "@/components/EyeCompliance";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Screen, Text } from "@/components/ui";

/**
 * Göz analizi: Uyum kartı (Gün/Hafta/Ay) tek başına. Aynı kart Göz molası
 * ekranında da gömülü; burası yalnızca odaklı, geniş görünüm.
 */
export default function EyeAnalysisScreen() {
  return (
    <Screen edges={["top", "bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-[18px] px-[18px] pb-10 pt-2">
        <ScreenHeader title="Göz analizi" />
        <EyeCompliance initialPeriod="weekly" />
        <View className="rounded-card bg-t100 p-4">
          <Text variant="bodySm" className="font-bodyMedium">
            Düzenli mola vermek göz kuruluğu ve gerilim tipi baş ağrısı riskini azaltabilir.
          </Text>
        </View>
        <Text variant="bodySm" muted className="px-1">
          Bu bir tıbbi değerlendirme değildir.
        </Text>
      </ScrollView>
    </Screen>
  );
}
