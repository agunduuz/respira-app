import { Tabs } from "expo-router";
import { Eye, Settings, Wind } from "lucide-react-native";

import { useThemeStore } from "@/theme/theme-store";
import { darkPalette, lightPalette, touchTarget } from "@/theme/tokens";

export default function TabLayout() {
  const preference = useThemeStore((s) => s.preference);
  const palette = preference === "light" ? lightPalette : darkPalette;
  const rgb = (c: string) => `rgb(${c.split(" ").join(", ")})`;

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
          title: "Bugün",
          // Dekoratif değil — sekmenin anlamını taşıyor, ama görünür etiket
          // zaten var, o yüzden ikon erişilebilirlik ağacından gizleniyor.
          tabBarIcon: ({ color }) => <Eye size={24} strokeWidth={1.75} color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: "Nefes",
          tabBarIcon: ({ color }) => <Wind size={24} strokeWidth={1.75} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ayarlar",
          tabBarIcon: ({ color }) => <Settings size={24} strokeWidth={1.75} color={color} />,
        }}
      />
    </Tabs>
  );
}
