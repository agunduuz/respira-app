import { router, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import { useAuthStore } from "@/lib/auth-store";
import { useBootstrap, useConsentStatus } from "@/lib/queries";

/**
 * Uygulamanın giriş kapısı. Üç durumu yönetiyor:
 *   1. oturum yok           → /sign-in
 *   2. oturum var, rıza eksik → /aydinlatma  (docs/02: veri toplanmadan önce)
 *   3. her şey tamam         → sekmeler
 *
 * Rıza durumu sunucudan geliyor; istemcide "onayladı" bayrağı tutmuyoruz ki
 * uygulama silinip yeniden kurulduğunda kontrol atlanamasın.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const session = useAuthStore((s) => s.session);
  const authLoading = useAuthStore((s) => s.loading);
  const segments = useSegments();

  const signedIn = !!session;
  // User satırı olmadan rıza kaydı yazılamaz — önce bootstrap.
  const bootstrap = useBootstrap(signedIn);
  const consents = useConsentStatus(signedIn && bootstrap.isSuccess);

  const inAuthGroup = segments[0] === "(auth)";
  const inOnboarding = segments[0] === "(onboarding)";

  const missingCount = consents.data?.missing.length ?? null;

  useEffect(() => {
    if (authLoading) return;

    if (!signedIn) {
      if (!inAuthGroup) router.replace("/sign-in");
      return;
    }

    // Rıza durumu daha gelmediyse yönlendirme yapma — yanlış ekrana atmayalım.
    if (missingCount === null) return;

    if (missingCount > 0) {
      if (!inOnboarding) {
        // Aydınlatma hâlâ eksikse baştan, sadece açık rıza eksikse ikinci adımdan.
        const needsAydinlatma = consents.data?.missing.some(
          (m) => m.consentType === "AYDINLATMA_METNI"
        );
        router.replace(needsAydinlatma ? "/aydinlatma" : "/acik-riza");
      }
      return;
    }

    if (inAuthGroup || inOnboarding) router.replace("/");
  }, [authLoading, signedIn, missingCount, inAuthGroup, inOnboarding, consents.data]);

  const settling =
    authLoading || (signedIn && (bootstrap.isPending || (bootstrap.isSuccess && consents.isPending)));

  if (settling) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator />
      </View>
    );
  }

  return <>{children}</>;
}
