import { Tabs } from "expo-router";

import { CapsuleTabBar } from "@/components/CapsuleTabBar";

/**
 * 4 sekme, Lavanta Blok kapsül gezinmesiyle: Anasayfa (home) · Modüller
 * (grid_view) · Beslenme (bar_chart) · Profil (person). Başlık yok — her ekran
 * kendi başlık bloğunu çiziyor.
 */
export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <CapsuleTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Anasayfa" }} />
      <Tabs.Screen name="bugun" options={{ title: "Modüller" }} />
      <Tabs.Screen name="nutrition" options={{ title: "Beslenme" }} />
      <Tabs.Screen name="profile" options={{ title: "Profil" }} />
    </Tabs>
  );
}
