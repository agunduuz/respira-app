import { CURRENT_CONSENT_VERSIONS } from "@respira/shared-types";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { Button, Checkbox, Screen, Text } from "@/components/ui";
import { ACIK_RIZA_METNI, ACIK_RIZA_ONAY_IFADESI } from "@/constants/legal";
import { useGrantConsent } from "@/lib/queries";

/**
 * docs/02 adım 2 — Açık Rıza.
 * Aydınlatmadan AYRI, aktif bir onay adımı. Kutu önceden işaretli değil ve
 * işaretlenmeden buton etkinleşmiyor (KVKK md. 6 açık rıza şartı).
 */
export default function AcikRizaScreen() {
  const [accepted, setAccepted] = useState(false);
  const grant = useGrantConsent();

  async function submit() {
    await grant.mutateAsync({
      consentType: "OZEL_NITELIKLI_VERI_RIZASI",
      textVersion: CURRENT_CONSENT_VERSIONS.OZEL_NITELIKLI_VERI_RIZASI,
    });
    // Yönlendirmeyi kapı yapar: eksik rıza kalmayınca sekmelere geçilir.
  }

  return (
    <Screen>
      <ScrollView contentContainerClassName="gap-4 p-6 pb-4">
        <View className="gap-1">
          <Text variant="label" muted>
            2 / 2
          </Text>
          <Text variant="displayLg">Açık Rıza</Text>
        </View>
        <Text variant="bodySm" className="leading-6">
          {ACIK_RIZA_METNI}
        </Text>
      </ScrollView>

      <View className="gap-2 border-t border-border p-6">
        <Checkbox checked={accepted} onChange={setAccepted} label={ACIK_RIZA_ONAY_IFADESI} />
        <Button
          title="Onaylıyorum"
          onPress={submit}
          disabled={!accepted}
          loading={grant.isPending}
        />
        {grant.isError ? (
          <Text variant="bodySm" className="text-danger">
            Kaydedilemedi. Bağlantını kontrol edip tekrar dene.
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}
