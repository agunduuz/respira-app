import { Text, View } from "react-native";

// Kurulum doğrulama ekranı — docs/01-TASARIM-SISTEMI.md uygulanınca değişecek.
export default function TabOneScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-white px-6 dark:bg-neutral-950">
      <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Respira</Text>
      <Text className="text-center text-base text-neutral-500 dark:text-neutral-400">
        Kurulum tamam. NativeWind, Expo Router ve React Query bağlı.
      </Text>
    </View>
  );
}
