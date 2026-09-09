import { eyeStrainSettingsSchema } from "@respira/shared-types";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, TextInput, View } from "react-native";

import { Button, Card, Screen, Text } from "@/components/ui";
import { useEyeStrainSettings, useUpdateEyeStrainSettings } from "@/lib/eye-strain-queries";
import { useEyeStrainStore } from "@/lib/eye-strain-store";
import { DEFAULT_QUIET_HOURS, cancelCategory, scheduleRepeatingReminder } from "@/lib/notifications";
import { touchTarget } from "@/theme/tokens";

/** docs/03 → dakika ve saniye bağımsız değiştirilebilir. */
export default function EyeStrainSettingsScreen() {
  const { data } = useEyeStrainSettings();
  const update = useUpdateEyeStrainSettings();
  const store = useEyeStrainStore();

  const [minutes, setMinutes] = useState("20");
  const [seconds, setSeconds] = useState("20");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setMinutes(String(data.intervalMinutes));
      setSeconds(String(data.breakSeconds));
    }
  }, [data]);

  async function save() {
    setError(null);
    const parsed = eyeStrainSettingsSchema.safeParse({
      intervalMinutes: Number(minutes),
      breakSeconds: Number(seconds),
    });

    if (!parsed.success) {
      setError("Süre 1-180 dakika ve 5-300 saniye aralığında olmalı.");
      return;
    }

    await update.mutateAsync(parsed.data);

    // docs/03 kabul kriteri: "değişiklik anında bildirim planına yansıyor".
    // Sayaç çalışıyorsa planı yeni aralıkla yeniden kur; duruyorsa sadece
    // eski planı temizle ki eski aralıkla bildirim gelmesin.
    if (store.phase === "working") {
      const times = await scheduleRepeatingReminder({
        category: "eye_strain",
        title: "Gözlerine mola ver",
        body: `${parsed.data.breakSeconds} saniye boyunca 6 metre uzağa bak.`,
        intervalSeconds: parsed.data.intervalMinutes * 60,
        quietHours: DEFAULT_QUIET_HOURS,
      });
      store.setScheduled(times.map((t) => t.getTime()));
      // Yeni aralık şu andan itibaren saysın.
      store.start();
    } else {
      await cancelCategory("eye_strain");
      store.setScheduled([]);
    }

    router.back();
  }

  const inputClass =
    "rounded-md border border-border-strong bg-surface px-4 font-data text-data text-text";

  return (
    <Screen edges={["bottom"]}>
      <ScrollView contentContainerClassName="gap-4 p-4">
        <Card className="gap-4">
          <View className="gap-2">
            <Text variant="label" muted>
              ÇALIŞMA SÜRESİ (DAKİKA)
            </Text>
            <TextInput
              value={minutes}
              onChangeText={setMinutes}
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={3}
              accessibilityLabel="Çalışma süresi, dakika"
              style={{ minHeight: touchTarget.min }}
              className={inputClass}
            />
          </View>

          <View className="gap-2">
            <Text variant="label" muted>
              MOLA SÜRESİ (SANİYE)
            </Text>
            <TextInput
              value={seconds}
              onChangeText={setSeconds}
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={3}
              accessibilityLabel="Mola süresi, saniye"
              style={{ minHeight: touchTarget.min }}
              className={inputClass}
            />
          </View>

          <Text variant="bodySm" muted>
            Varsayılan 20 dakika / 20 saniye, 20-20-20 kuralına dayanır: her 20
            dakikada bir, 20 saniye boyunca 6 metre uzağa bakmak.
          </Text>

          {error ? (
            <Text variant="bodySm" className="text-danger">
              {error}
            </Text>
          ) : null}

          <Button title="Kaydet" onPress={save} loading={update.isPending} />
        </Card>
      </ScrollView>
    </Screen>
  );
}
