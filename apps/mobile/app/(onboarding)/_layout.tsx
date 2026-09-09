import { Stack } from "expo-router";

// Onboarding sırasında geri gitme yok: rıza akışı sırayla tamamlanmalı,
// kullanıcı aydınlatma metnini atlayıp doğrudan rızaya geçememeli.
export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false, gestureEnabled: false }} />;
}
