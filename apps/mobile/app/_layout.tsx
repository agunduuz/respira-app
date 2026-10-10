import "../global.css";

// Alt yoldan import: paket kökünden alınca ailenin TÜM ağırlıkları bundle'a
// giriyor. Böylece sadece kullandığımız dosyalar gömülüyor.
import { MaterialSymbolsRounded_400Regular } from "@expo-google-fonts/material-symbols-rounded/400Regular";
import { Urbanist_400Regular } from "@expo-google-fonts/urbanist/400Regular";
import { Urbanist_500Medium } from "@expo-google-fonts/urbanist/500Medium";
import { Urbanist_600SemiBold } from "@expo-google-fonts/urbanist/600SemiBold";
import { Urbanist_700Bold } from "@expo-google-fonts/urbanist/700Bold";
import { Urbanist_800ExtraBold } from "@expo-google-fonts/urbanist/800ExtraBold";
import { Urbanist_900Black } from "@expo-google-fonts/urbanist/900Black";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthGate } from "@/components/AuthGate";
import { EyeTimerEngine } from "@/components/EyeTimerEngine";
import { initAuth } from "@/lib/auth-store";
import { useDailyModulesStore } from "@/lib/daily-modules-store";
import { loadSkia } from "@/lib/skia-loader";
import { useWelcomeStore } from "@/lib/welcome-store";
import { ThemeRoot } from "@/components/ThemeRoot";
import { useHueStore } from "@/theme/hue-store";
import { initTheme, useThemeStore } from "@/theme/theme-store";
import { rgb, usePalette } from "@/theme/use-palette";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

// NativeWind'e koyu temayı modül yüklenirken bildiriyoruz ki ilk kare bile
// doğru renklerle çizilsin (açılışta açık→koyu sıçraması olmasın).
initTheme();

export default function RootLayout() {
  // Web'de Skia (CanvasKit WASM) çizimden önce yüklenmeli; native'de anında geçer.
  const [skiaReady, setSkiaReady] = useState(false);
  useEffect(() => {
    loadSkia().then(
      () => setSkiaReady(true),
      // Yükleme başarısız olursa uygulamayı kilitleme: Skia'sız da açılsın,
      // yalnızca Canvas kullanan bileşenler boş kalır.
      (err) => {
        console.error("[respira] Skia yüklenemedi:", err);
        setSkiaReady(true);
      }
    );
  }, []);

  const [loaded, error] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
    Urbanist_800ExtraBold,
    Urbanist_900Black,
    MaterialSymbolsRounded_400Regular,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Kayıtlı oturumu expo-secure-store'dan oku ve değişiklikleri dinle.
  useEffect(() => initAuth(), []);
  // Karşılama akışının daha önce görülüp görülmediğini AsyncStorage'dan oku.
  useEffect(() => {
    void useWelcomeStore.getState().hydrate();
  }, []);
  useEffect(() => {
    void useDailyModulesStore.getState().hydrate();
  }, []);
  // Kayıtlı tema tercihini ve ana rengi oku; okunana kadar çizmiyoruz ki
  // varsayılan renkten seçilene sıçrama (yanıp sönme) olmasın.
  const themeHydrated = useThemeStore((s) => s.hydrated);
  const hueHydrated = useHueStore((s) => s.hydrated);
  useEffect(() => {
    void useThemeStore.getState().hydrate();
    void useHueStore.getState().hydrate();
  }, []);

  if (!loaded || !skiaReady || !themeHydrated || !hueHydrated) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const palette = usePalette();

  // Navigasyon kabuğu (başlık, kart arka planı) NativeWind sınıflarını değil
  // JS renklerini okuduğu için token'ları buraya geçiriyoruz.
  const navTheme = {
    dark: false,
    colors: {
      primary: rgb(palette.accent),
      background: rgb(palette.bg),
      card: rgb(palette.surface),
      text: rgb(palette.text),
      border: rgb(palette.border),
      notification: rgb(palette.warm),
    },
    fonts: {
      regular: { fontFamily: "Urbanist_500Medium", fontWeight: "500" as const },
      medium: { fontFamily: "Urbanist_600SemiBold", fontWeight: "600" as const },
      bold: { fontFamily: "Urbanist_800ExtraBold", fontWeight: "800" as const },
      heavy: { fontFamily: "Urbanist_900Black", fontWeight: "900" as const },
    },
  };

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000, retry: 2 } },
      })
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          {/* ThemeProvider tab bar ve başlıkları da boyar — Stack'e tek tek
              screenOptions vermek yeterli olmaz. */}
          <ThemeProvider value={navTheme}>
            <ThemeRoot>
            <AuthGate>
              <EyeTimerEngine />
              <Stack
                screenOptions={{
                  contentStyle: { backgroundColor: rgb(palette.bg) },
                  headerStyle: { backgroundColor: rgb(palette.bg) },
                  headerShadowVisible: false,
                  headerTintColor: rgb(palette.t900),
                  headerTitleStyle: { fontFamily: "Urbanist_800ExtraBold", color: rgb(palette.t900) },
                  // Route grup adları ("(tabs)" gibi) geri butonunda metin
                  // olarak sızmasın diye geri butonu sadece ok işareti gösterir.
                  headerBackButtonDisplayMode: "minimal",
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(welcome)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="modal"
                  options={{ presentation: "modal", title: "Hakkında" }}
                />
                <Stack.Screen
                  name="eye-strain-settings"
                  options={{ presentation: "modal", title: "Göz molası ayarları" }}
                />
                <Stack.Screen name="settings" options={{ title: "Ayarlar" }} />
                <Stack.Screen name="eye" options={{ headerShown: false }} />
                <Stack.Screen name="water" options={{ headerShown: false }} />
                <Stack.Screen name="posture" options={{ headerShown: false }} />
                <Stack.Screen name="stress" options={{ headerShown: false }} />
                <Stack.Screen name="eye-analysis" options={{ headerShown: false }} />
                <Stack.Screen name="nutrition-survey" options={{ title: "Beslenme anketi" }} />
                <Stack.Screen name="posture-form" options={{ title: "Duruş profili" }} />
                <Stack.Screen name="water-goal" options={{ title: "Su hedefi" }} />
                <Stack.Screen
                  name="breathing-session"
                  options={{ presentation: "modal", headerShown: false }}
                />
                <Stack.Screen name="nutrition-report" options={{ title: "Beslenme raporu" }} />
                <Stack.Screen
                  name="meal-entry"
                  options={{ presentation: "modal", headerShown: false }}
                />
                <Stack.Screen
                  name="blood-test-reminder"
                  options={{ presentation: "modal", title: "Kan tahlili hatırlatması" }}
                />
              </Stack>
            </AuthGate>
            </ThemeRoot>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
