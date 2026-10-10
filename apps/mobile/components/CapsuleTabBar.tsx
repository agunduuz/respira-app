import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs/types";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/ui";

/** Sekme rotası → Material Symbols ikonu (Lavanta Blok: home · grid_view · bar_chart · person). */
const TAB_ICONS: Record<string, string> = {
  index: "home",
  bugun: "grid_view",
  nutrition: "bar_chart",
  profile: "person",
};

/**
 * Lavanta Blok siyah kapsül gezinme çubuğu: ekranın altında yüzen, t900 zeminli,
 * 74px yüksekliğinde tam yuvarlak bir çubuk. Aktif sekme beyaz bir hap (92×62)
 * içinde, diğerleri beyaz ikon olarak durur. Çubuk içeriğin ÜSTÜNDE yüzdüğü
 * için ekranlar altta ~130px boşluk bırakır.
 */
export function CapsuleTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", left: 18, right: 18, bottom: Math.max(insets.bottom, 8) + 18 }}
    >
      <View
        accessibilityRole="tablist"
        className="h-[74px] flex-row items-center justify-between rounded-capsule bg-t900 px-[6px]"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 8,
        }}
      >
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;

          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: focused }}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
              style={{ width: focused ? 92 : 62, height: 62, alignItems: "center", justifyContent: "center" }}
              className={focused ? "rounded-full bg-white active:scale-95" : "rounded-full active:scale-95"}
            >
              <Icon
                name={TAB_ICONS[route.name] ?? "circle"}
                size={28}
                className={focused ? "text-t900" : "text-white"}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
