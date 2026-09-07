import { Canvas, Circle, Group } from "@shopify/react-native-skia";
import { Text, View } from "react-native";

// Skia'nın gerçekten çizim yaptığını doğrulayan geçici ekran.
// Nefes egzersizi / su bardağı animasyonları buradaki Canvas üzerine kurulacak.
export default function TabTwoScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-white dark:bg-neutral-950">
      <Canvas style={{ width: 200, height: 200 }}>
        <Group>
          <Circle cx={100} cy={100} r={80} color="#38bdf8" />
          <Circle cx={100} cy={100} r={50} color="#0ea5e9" />
        </Group>
      </Canvas>
      <Text className="text-base text-neutral-500 dark:text-neutral-400">Skia canvas çalışıyor</Text>
    </View>
  );
}
