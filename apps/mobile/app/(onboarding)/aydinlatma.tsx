import { CURRENT_CONSENT_VERSIONS } from "@respira/shared-types";
import { router } from "expo-router";
import { ScrollView, View } from "react-native";

import { Button, Screen, Text } from "@/components/ui";
import { AYDINLATMA_METNI } from "@/constants/legal";
import { useGrantConsent } from "@/lib/queries";

/**
 * docs/02 adım 1 — Aydınlatma Metni.
 * Veri toplanmadan ÖNCE, onboarding'in ilk ekranında gösterilir.
 * Bu ekranda rıza alınmaz; yalnızca bilgilendirme okundu kaydı tutulur.
 */
export default function AydinlatmaScreen() {
  const grant = useGrantConsent();

  async function accept() {
    await grant.mutateAsync({
      consentType: "AYDINLATMA_METNI",
      textVersion: CURRENT_CONSENT_VERSIONS.AYDINLATMA_METNI,
    });
    router.replace("/acik-riza");
  }

  return (
    <Screen>
      <ScrollView contentContainerClassName="gap-4 p-6 pb-4">
        <View className="gap-1">
          <Text variant="label" muted>
            1 / 2
          </Text>
          <Text variant="displayLg">Aydınlatma Metni</Text>
        </View>
        <Text variant="bodySm" className="leading-6">
          {AYDINLATMA_METNI}
        </Text>
      </ScrollView>

      <View className="gap-2 border-t border-border p-6">
        <Button title="Okudum, devam et" onPress={accept} loading={grant.isPending} />
        {grant.isError ? (
          <Text variant="bodySm" className="text-danger">
            Kaydedilemedi. Bağlantını kontrol edip tekrar dene.
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}
