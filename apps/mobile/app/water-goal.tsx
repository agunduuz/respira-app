import {
  DEFAULT_WATER_SLEEP_TIME,
  DEFAULT_WATER_WAKE_TIME,
  computeWaterGoalMl,
  waterGoalSchema,
} from "@respira/shared-types";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";

import { StepFlow } from "@/components/flow/StepFlow";
import { Field } from "@/components/nutrition/Field";
import { TimePickerField } from "@/components/nutrition/TimePickerField";
import { Button, Card, Text } from "@/components/ui";
import { useNutritionProfile } from "@/lib/nutrition-queries";
import { useSaveWaterGoal, useWaterGoal } from "@/lib/water-queries";

const STEP_TITLES = ["Günlük hedefin", "Ne zaman uyanıksın?"];

/**
 * docs/06 — hedef, kilodan otomatik hesaplanır ve kullanıcı elle
 * değiştirebilir. 2 kısa adım: hedef, sonra uyanıklık penceresi.
 */
export default function WaterGoalScreen() {
  const { data } = useWaterGoal();
  const { data: nutrition } = useNutritionProfile();
  const save = useSaveWaterGoal();

  const [step, setStep] = useState(1);
  const goBack = useCallback(() => setStep((s) => Math.max(1, s - 1)), []);

  const [weight, setWeight] = useState("");
  const [target, setTarget] = useState("");
  const [wakeTime, setWakeTime] = useState(DEFAULT_WATER_WAKE_TIME);
  const [sleepTime, setSleepTime] = useState(DEFAULT_WATER_SLEEP_TIME);
  const [customized, setCustomized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Sunucudan gelen kayıtlı hedefi bir kerelik düzenlenebilir yerel forma
    // kopyalıyoruz — react-query verisini forma senkronlamanın standart yolu.
    if (hydrated) return;
    const goal = data?.goal;
    const knownWeight = nutrition?.profile?.weightKg;

    if (goal) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      const issue = parsed.error.issues[0];
      setError(issue?.message ?? "Formda eksik veya hatalı alan var.");
      setStep(issue?.path[0] === "dailyTargetMl" ? 1 : 2);
      return;
    }

    try {
      await save.mutateAsync(parsed.data);
      if (router.canGoBack()) router.back();
      else router.replace("/water");
    } catch {
      setError("Kaydedilemedi, tekrar dene.");
    }
  }

  const total = STEP_TITLES.length;
  const targetValid = Number(target) > 0;

  return (
    <StepFlow
      step={step}
      total={total}
      title={STEP_TITLES[step - 1]}
      onBack={goBack}
      onNext={step < total ? () => setStep(step + 1) : submit}
      nextDisabled={step === 1 && !targetValid}
      loading={save.isPending}
      error={error}
    >
      {step === 1 ? (
        <>
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
        </>
      ) : null}

      {step === 2 ? (
        <Card className="gap-3">
          <Text variant="bodySm" muted>
            Saatlik referans ve hatırlatmalar bu aralığa göre dağıtılır.
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <TimePickerField label="Uyanma" value={wakeTime} onChange={setWakeTime} />
            </View>
            <View className="flex-1">
              <TimePickerField label="Uyku" value={sleepTime} onChange={setSleepTime} />
            </View>
          </View>
        </Card>
      ) : null}
    </StepFlow>
  );
}
