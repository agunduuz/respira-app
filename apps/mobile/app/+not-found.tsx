import { Link, Stack } from "expo-router";

import { Screen, Text } from "@/components/ui";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Bulunamadı" }} />
      <Screen className="items-center justify-center gap-4 p-6">
        <Text variant="title">Bu ekran yok.</Text>
        <Link href="/" accessibilityRole="link">
          <Text variant="label" className="text-accent">
            Ana ekrana dön
          </Text>
        </Link>
      </Screen>
    </>
  );
}
