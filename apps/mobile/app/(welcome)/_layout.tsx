import { router, Stack, usePathname } from "expo-router";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FlowProgress } from "@/components/flow/FlowProgress";
import { Text } from "@/components/ui";
import { WelcomeBackdrop } from "@/components/WelcomeBackdrop";
import { useWelcomeStore } from "@/lib/welcome-store";

const STEPS = ["/ozellikler", "/basla"];
const TOTAL = STEPS.length + 1;

async function skip() {
  await useWelcomeStore.getState().markSeen();
  router.replace("/sign-in");
}

// Onboarding grubuyla aynı kural: geri kaydırmayla akıştan çıkılamaz,
// "Atla" veya son ekrandaki "Başla" tek çıkış yolu. İlerleme çubuğu layout'ta
// duruyor ki ekran değişirken yeniden mount olmadan bir sonraki segmente dolsun.
export default function WelcomeLayout() {
  const pathname = usePathname();
  const step = Math.max(0, STEPS.indexOf(pathname) + 1);
  const isLast = step === TOTAL - 1;

  return (
    <View style={{ flex: 1 }}>
      <WelcomeBackdrop step={step} />
      <SafeAreaView edges={["top"]}>
        <View className="flex-row items-center gap-4 px-6 py-3">
          <FlowProgress current={step + 1} total={TOTAL} className="flex-1" />
          {/* Son adımda gizleniyor ama yeri korunuyor — çubuğun genişliği zıplamasın. */}
          <Pressable
            onPress={skip}
            disabled={isLast}
            accessibilityRole="button"
            accessibilityElementsHidden={isLast}
            importantForAccessibility={isLast ? "no-hide-descendants" : "auto"}
            hitSlop={8}
            className="px-2 py-1"
            style={{ opacity: isLast ? 0 : 1 }}
          >
            <Text variant="label" muted>
              Atla
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          animation: "fade",
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
    </View>
  );
}
