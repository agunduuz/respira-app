import { Tabs } from "expo-router";
import { House, Sun, User, UtensilsCrossed } from "lucide-react-native";

import { touchTarget } from "@/theme/tokens";
import { rgb, usePalette } from "@/theme/use-palette";

export default function TabLayout() {
  const palette = usePalette();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: rgb(palette.accent),
        tabBarInactiveTintColor: rgb(palette.textMuted),
        tabBarStyle: {
          backgroundColor: rgb(palette.surface),
          borderTopColor: rgb(palette.border),
          // Sekme öğeleri en az 48dp yüksekliğinde kalsın.
          minHeight: touchTarget.min,
        },
        tabBarLabelStyle: { fontFamily: "Inter_500Medium", fontSize: 12 },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Anasayfa",
          // Dekoratif değil — sekmenin anlamını taşıyor, ama görünür etiket
          // zaten var, o yüzden ikon erişilebilirlik ağacından gizleniyor.
          tabBarIcon: ({ color }) => <House size={24} strokeWidth={1.75} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bugun"
        options={{
          title: "Bugün",
          tabBarIcon: ({ color }) => <Sun size={24} strokeWidth={1.75} color={color} />,
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: "Beslenme",
          tabBarIcon: ({ color }) => <UtensilsCrossed size={24} strokeWidth={1.75} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <User size={24} strokeWidth={1.75} color={color} />,
        }}
      />
    </Tabs>
  );
}
