import {
  DEFAULT_WATER_SLEEP_TIME,
  DEFAULT_WATER_WAKE_TIME,
  computeWaterGoalMl,
  waterGoalSchema,
} from "@respira/shared-types";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

import { Field } from "@/components/nutrition/Field";
import { Button, Card, Screen, Text } from "@/components/ui";
import { useNutritionProfile } from "@/lib/nutrition-queries";
import { useSaveWaterGoal, useWaterGoal } from "@/lib/water-queries";

/** docs/06 — hedef, kilodan otomatik hesaplanır ve kullanıcı elle değiştirebilir. */
export default function WaterGoalScreen() {
  const { data } = useWaterGoal();
  const { data: nutrition } = useNutritionProfile();
  const save = useSaveWaterGoal();

  const [weight, setWeight] = useState("");
  const [target, setTarget] = useState("");
  const [wakeTime, setWakeTime] = useState(DEFAULT_WATER_WAKE_TIME);
  const [sleepTime, setSleepTime] = useState(DEFAULT_WATER_SLEEP_TIME);
  const [customized, setCustomized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (hydrated) return;
    const goal = data?.goal;
    const knownWeight = nutrition?.profile?.weightKg;

    if (goal) {
      setTarget(String(goal.dailyTargetMl));
      setWakeTime(goal.wakeTime);
      setSleepTime(goal.sleepTime);
      setCustomized(goal.isCustomized);
      if (knownWeight) setWeight(String(knownWeight));
      setHydrated(true);
    } else if (data && knownWeight) {
      // İlk kurulum — beslenme profilindeki kiloyu kullanıp öneri hesaplıyoruz.
      setWeight(String(knownWeight));
      setTarget(String(computeWaterGoalMl(knownWeight)));
      setHydrated(true);
    } else if (data) {
      setHydrated(true);
    }
  }, [data, nutrition, hydrated]);

  function recalculate() {
    const w = Number(weight);
    if (!Number.isFinite(w) || w <= 0) {
      setError("Önce geçerli bir kilo gir.");
      return;
    }
    setTarget(String(computeWaterGoalMl(w)));
    setCustomized(false);
    setError(null);
  }

  async function submit() {
    setError(null);
    const parsed = waterGoalSchema.safeParse({
      dailyTargetMl: Number(target),
      isCustomized: customized,
      wakeTime,
      sleepTime,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Formda eksik veya hatalı alan var.");
      return;
    }

    try {
      await save.mutateAsync(parsed.data);
      if (router.canGoBack()) router.back();
      else router.replace("/(tabs)/water");
    } catch {
      setError("Kaydedilemedi, tekrar dene.");
    }
  }

  return (
    <Screen edges={["top"]}>
      <ScrollView contentContainerClassName="gap-6 p-4 pb-12">
        <View className="gap-1">
          <Text variant="label" muted>
            SU HEDEFİ
          </Text>
          <Text variant="displayLg">Günlük hedefin</Text>
        </View>

        <Card className="gap-3">
          <Field
            label="Kilo (kg)"
            optional
            hint="Öneri hesaplamak için kullanılır, kaydedilmez."
            keyboardType="decimal-pad"
            value={weight}
            onChangeText={setWeight}
          />
          <Button title="Kilodan hesapla" variant="secondary" onPress={recalculate} />
        </Card>

        <Card className="gap-3">
          <Field
            label="Günlük hedef (ml)"
            keyboardType="number-pad"
            value={target}
            onChangeText={(v) => {
              setTarget(v);
              setCustomized(true);
            }}
          />
          <Text variant="bodySm" muted>
            Bu genel bir tahmindir; sıcak hava, yoğun egzersiz gibi durumlarda ihtiyacın
            artabilir.
          </Text>
        </Card>

        <Card className="gap-3">
          <Text variant="label" muted>
            UYANIKLIK PENCERESİ
          </Text>
          <Text variant="bodySm" muted>
            Saatlik referans ve hatırlatmalar bu aralığa göre dağıtılır.
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field label="Uyanma" value={wakeTime} onChangeText={setWakeTime} placeholder="08:00" />
            </View>
            <View className="flex-1">
              <Field label="Uyku" value={sleepTime} onChangeText={setSleepTime} placeholder="23:00" />
            </View>
          </View>
        </Card>

        {error ? (
          <Text variant="bodySm" className="text-danger">
            {error}
          </Text>
        ) : null}

        <Button title="Kaydet" loading={save.isPending} onPress={submit} />
      </ScrollView>
    </Screen>
  );
}
