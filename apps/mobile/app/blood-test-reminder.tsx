import {
  BLOOD_TEST_INTERVAL_PRESETS,
  BLOOD_TEST_LEGAL_NOTICE,
} from "@respira/shared-types";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, TextInput, View } from "react-native";

import { DatePickerField } from "@/components/nutrition/DatePickerField";
import { Button, Card, Checkbox, Screen, Text } from "@/components/ui";
import { useBloodTestReminder, useEnableBloodTestReminder } from "@/lib/blood-test-queries";
import { DEFAULT_QUIET_HOURS, ensurePermission, scheduleOneShotReminder } from "@/lib/notifications";
import { useNutritionProfile } from "@/lib/nutrition-queries";
import { touchTarget } from "@/theme/tokens";

type Step = "ask" | "interval";

/**
 * docs/04 Adım 4 — kan tahlili hatırlatma akışı.
 *
 * Sıra doc'taki gibi: (1) istiyor musun → (2) ne sıklıkta → (3) yasal uyarı
 * ZORUNLU olarak gösterilir ve onaylatılır. Onay kutusu işaretlenmeden
 * "Hatırlatmayı kur" etkinleşmiyor; sunucu da rızasız isteği reddediyor.
 */
export default function BloodTestReminderScreen() {
  const { data: profileData, isPending: profilePending } = useNutritionProfile();
  const { data, isPending } = useBloodTestReminder();
  const save = useEnableBloodTestReminder();

  const [step, setStep] = useState<Step>("ask");
  const [months, setMonths] = useState<number | null>(6);
  const [customMonths, setCustomMonths] = useState("");
  const [lastDate, setLastDate] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduled, setScheduled] = useState<string | null>(null);

  useEffect(() => {
    // Sunucudan gelen kayıtlı hatırlatmayı bir kerelik düzenlenebilir yerel
    // forma kopyalıyoruz — react-query verisini forma senkronlamanın standart yolu.
    if (data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLastDate(data.lastBloodTestDate ?? "");
      if (data.reminderMonths) {
        setMonths(data.reminderMonths);
        setStep("interval");
      }
    }
  }, [data]);

  const effectiveMonths = months === null ? Number(customMonths) : months;
  const monthsValid = Number.isInteger(effectiveMonths) && effectiveMonths >= 1 && effectiveMonths <= 60;
  const dateValid = lastDate === "" || /^\d{4}-\d{2}-\d{2}$/.test(lastDate);

  async function enable() {
    setError(null);
    if (!monthsValid) {
      setError("Hatırlatma aralığı 1-60 ay arasında olmalı.");
      return;
    }
    if (!dateValid) {
      setError("Tarih YYYY-AA-GG biçiminde olmalı (örn. 2026-01-15).");
      return;
    }

    try {
      const result = await save.mutateAsync({
        lastBloodTestDate: lastDate === "" ? null : lastDate,
        reminderMonths: effectiveMonths,
        acknowledged,
      });

      if (result.scheduledFor) {
        const granted = await ensurePermission();
        if (granted) {
          const when = await scheduleOneShotReminder({
            category: "blood_test",
            title: "Kan tahlili zamanı",
            body: "Son tahlilinin üzerinden belirlediğin süre geçti. Bir randevu almayı düşünebilirsin.",
            date: new Date(result.scheduledFor),
            quietHours: DEFAULT_QUIET_HOURS,
          });
          setScheduled(when ? when.toLocaleDateString("tr-TR") : null);
        } else {
          setError(
            "Hatırlatma kaydedildi ancak bildirim izni verilmediği için bildirim gönderilemeyecek."
          );
        }
      }
      if (!error) router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kaydedilemedi.");
    }
  }

  async function disable() {
    await save.mutateAsync({ reminderMonths: null, acknowledged: false });
    router.back();
  }

  if (isPending || profilePending) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator />
      </Screen>
    );
  }

  // Sunucu hatırlatmayı yalnızca bir beslenme profili varsa kurabiliyor
  // (NO_PROFILE hatası). Bu ham hatayı kullanıcıya göstermek yerine, profil
  // yoksa akışa hiç girmeden önce anketi tamamlamaya yönlendiriyoruz.
  if (!profileData?.profile) {
    return (
      <Screen className="items-center justify-center p-6">
        <Card className="items-center gap-3">
          <Text variant="title" className="text-center">
            Önce beslenme anketini tamamla
          </Text>
          <Text variant="bodySm" muted className="text-center">
            Kan tahlili hatırlatması, beslenme profilinin bir parçası. Anketi
            tamamladıktan sonra buraya dönüp kurabilirsin.
          </Text>
          <Button title="Beslenme anketine git" onPress={() => router.replace("/nutrition-survey")} />
        </Card>
      </Screen>
    );
  }

  const inputClass =
    "rounded-md border border-border-strong bg-surface px-4 font-data text-data text-text";

  return (
    <Screen edges={["bottom"]}>
      <ScrollView contentContainerClassName="gap-4 p-4 pb-8">
        {step === "ask" ? (
          <Card className="gap-3">
            <Text variant="title">Kan tahlili hatırlatması</Text>
            <Text variant="bodySm" muted>
              Bir sonraki kan tahlili için hatırlatma bildirimi almak ister misin?
            </Text>
            <Button title="Evet, hatırlat" onPress={() => setStep("interval")} />
            <Button title="Hayır, istemiyorum" variant="ghost" onPress={() => router.back()} />
          </Card>
        ) : (
          <>
            <Card className="gap-3">
              <Text variant="title">Ne kadar sürede?</Text>
              <View className="flex-row gap-2">
                {BLOOD_TEST_INTERVAL_PRESETS.map((m) => (
                  <Button
                    key={m}
                    title={`${m} ay`}
                    variant={months === m ? "primary" : "secondary"}
                    onPress={() => setMonths(m)}
                    className="flex-1"
                  />
                ))}
                <Button
                  title="Özel"
                  variant={months === null ? "primary" : "secondary"}
                  onPress={() => setMonths(null)}
                  className="flex-1"
                />
              </View>

              {months === null ? (
                <View className="gap-2">
                  <Text variant="label" muted>
                    KAÇ AY SONRA
                  </Text>
                  <TextInput
                    value={customMonths}
                    onChangeText={setCustomMonths}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    maxLength={2}
                    accessibilityLabel="Özel hatırlatma aralığı, ay"
                    style={{ minHeight: touchTarget.min }}
                    className={inputClass}
                  />
                </View>
              ) : null}

              <DatePickerField
                label="Son tahlil tarihi"
                optional
                value={lastDate}
                onChange={setLastDate}
                hint="Boş bırakırsan hatırlatma bugünden itibaren sayılır."
              />
            </Card>

            {/* docs/04: bu ibare ZORUNLU olarak gösterilir ve onaylatılır. */}
            <Card className="gap-3 border-warm">
              <Text variant="label" className="text-warm">
                ÖNEMLİ UYARI
              </Text>
              <Text variant="bodySm">{BLOOD_TEST_LEGAL_NOTICE}</Text>
              <Checkbox
                checked={acknowledged}
                onChange={setAcknowledged}
                label="Okudum ve anladım."
              />
            </Card>

            {error ? (
              <Text variant="bodySm" className="text-danger">
                {error}
              </Text>
            ) : null}
            {scheduled ? (
              <Text variant="bodySm" muted>
                Hatırlatma {scheduled} tarihine kuruldu.
              </Text>
            ) : null}

            <Button
              title="Hatırlatmayı kur"
              onPress={enable}
              disabled={!acknowledged}
              loading={save.isPending}
            />
            {data?.reminderMonths ? (
              <Button title="Hatırlatmayı kapat" variant="secondary" onPress={disable} />
            ) : null}
          </>
        )}

        <Text variant="bodySm" muted>
          Respira bir sağlık hizmeti sağlamaz.
        </Text>
      </ScrollView>
    </Screen>
  );
}
