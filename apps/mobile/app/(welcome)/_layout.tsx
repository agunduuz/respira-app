import { Stack } from "expo-router";

// Onboarding grubuyla aynı kural: geri kaydırmayla akıştan çıkılamaz,
// "Atla" veya son ekrandaki "Başla" tek çıkış yolu.
export default function WelcomeLayout() {
  return <Stack screenOptions={{ headerShown: false, gestureEnabled: false }} />;
}
