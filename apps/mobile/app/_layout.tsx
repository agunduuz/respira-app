import "../global.css";

// Alt yoldan import: paket kökünden alınca ailenin TÜM ağırlıkları bundle'a
// giriyor (37 ttf). Böylece sadece kullandığımız 6 dosya gömülüyor.
import { IBMPlexMono_500Medium } from "@expo-google-fonts/ibm-plex-mono/500Medium";
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { SpaceGrotesk_600SemiBold } from "@expo-google-fonts/space-grotesk/600SemiBold";
import { SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk/700Bold";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { initTheme, useThemeStore } from "@/theme/theme-store";
import { darkPalette, lightPalette } from "@/theme/tokens";

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
  const [loaded, error] = useFonts({
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    IBMPlexMono_500Medium,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const preference = useThemeStore((s) => s.preference);
  const isDark = preference !== "light";
  const palette = isDark ? darkPalette : lightPalette;

  // Navigasyon kabuğu (başlık, kart arka planı) NativeWind sınıflarını değil
  // JS renklerini okuduğu için token'ları buraya hex olarak geçiriyoruz.
  const rgb = (channels: string) => `rgb(${channels.split(" ").join(", ")})`;
  const navTheme = {
    dark: isDark,
    colors: {
      primary: rgb(palette.accent),
      background: rgb(palette.bg),
      card: rgb(palette.surface),
      text: rgb(palette.text),
      border: rgb(palette.border),
      notification: rgb(palette.warm),
    },
    fonts: {
      regular: { fontFamily: "Inter_400Regular", fontWeight: "400" as const },
      medium: { fontFamily: "Inter_500Medium", fontWeight: "500" as const },
      bold: { fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },
      heavy: { fontFamily: "SpaceGrotesk_700Bold", fontWeight: "700" as const },
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
          <StatusBar style={isDark ? "light" : "dark"} />
          {/* ThemeProvider tab bar ve başlıkları da boyar — Stack'e tek tek
              screenOptions vermek yeterli olmaz. */}
          <ThemeProvider value={navTheme}>
            <Stack
              screenOptions={{
                contentStyle: { backgroundColor: rgb(palette.bg) },
                headerTitleStyle: { fontFamily: "SpaceGrotesk_600SemiBold" },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="modal"
                options={{ presentation: "modal", title: "Hakkında" }}
              />
            </Stack>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
