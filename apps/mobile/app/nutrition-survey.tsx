import {
  MACRO_DISCLAIMER,
  calculateMacroTargets,
  nutritionProfileSchema,
  type BodyGoal,
  type NutritionProfileInput,
  type TrainingFrequency,
} from "@respira/shared-types";
import { Link, router } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import { ChoiceGroup } from "@/components/nutrition/ChoiceGroup";
import { Field } from "@/components/nutrition/Field";
import { Button, Card, Screen, Text } from "@/components/ui";
import { useNutritionProfile, useSaveNutritionProfile } from "@/lib/nutrition-queries";

const TRAINING_FREQ: readonly { value: TrainingFrequency; label: string }[] = [
  { value: "NEVER", label: "Hiçbir zaman" },
  { value: "ONE_TO_TWO", label: "1-2 gün" },
  { value: "TWO_TO_THREE", label: "2-3 gün" },
  { value: "FOUR_TO_FIVE", label: "4-5 gün" },
  { value: "DAILY", label: "Her gün" },
];

const TRAINING_TYPES = [
  "Koşu", "Yoga", "Fitness", "Crossfit", "Calisthenics", "Hybrid", "Diğer",
] as const;

const BODY_GOALS: readonly { value: BodyGoal; label: string }[] = [
  { value: "ATHLETIC", label: "Atletik" },
  { value: "MUSCLE_GAIN", label: "Kas kütlesi" },
  { value: "WEIGHT_LOSS", label: "Kilo verme" },
  { value: "MAINTENANCE", label: "Sabit kalma" },
  { value: "FAT_LOSS", label: "Yağ yakımı" },
];

type Draft = {
  mealsPerDay: string;
  age: string; heightCm: string; weightKg: string;
  biologicalSex: "MALE" | "FEMALE" | null;
  trainingFrequency: TrainingFrequency | null;
  trainingType: string | null;
  bodyGoal: BodyGoal | null;
  bodyFatPercent: string;
  neck: string; arm: string; waist: string; hip: string;
  targetCalories: string; targetProteinG: string; targetCarbsG: string; targetFatG: string;
  macrosCustomized: boolean;
  bloodType: string; sugarNeedRate: string; lastBloodTestDate: string;
};

const EMPTY: Draft = {
  mealsPerDay: "3", age: "", heightCm: "", weightKg: "", biologicalSex: null,
  trainingFrequency: null, trainingType: null, bodyGoal: null,
  bodyFatPercent: "", neck: "", arm: "", waist: "", hip: "",
  targetCalories: "", targetProteinG: "", targetCarbsG: "", targetFatG: "",
  macrosCustomized: false,
  bloodType: "", sugarNeedRate: "", lastBloodTestDate: "",
};

const num = (s: string) => (s.trim() === "" ? null : Number(s));

/**
 * docs/04 — 5 adımlı kullanıcı tanıma anketi.
 *
 * Adımlar tek ekranda state ile ilerliyor; her adımdan geri dönülebiliyor ve
 * Adım 5'teki özetten herhangi bir adıma atlanabiliyor (doc: "Düzenle ile
 * herhangi bir adıma geri dönebilir").
 */
export default function NutritionSurveyScreen() {
  const { data } = useNutritionProfile();
  const save = useSaveNutritionProfile();

  const [step, setStep] = useState(1);
  const [d, setD] = useState<Draft>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));

  // Adım 1-2 tamamsa makrolar canlı hesaplanıyor (docs/04 Adım 3).
  const computed = useMemo(() => {
    const age = num(d.age), h = num(d.heightCm), w = num(d.weightKg);
    if (!age || !h || !w || !d.trainingFrequency || !d.bodyGoal) return null;
    return calculateMacroTargets({
      age, heightCm: h, weightKg: w,
      biologicalSex: d.biologicalSex,
      trainingFrequency: d.trainingFrequency,
      bodyGoal: d.bodyGoal,
    });
  }, [d.age, d.heightCm, d.weightKg, d.biologicalSex, d.trainingFrequency, d.bodyGoal]);

  /** Kullanıcı elle değiştirmediyse hesaplanan değerleri göster. */
  const shown = d.macrosCustomized
    ? {
        targetCalories: num(d.targetCalories) ?? 0,
        targetProteinG: num(d.targetProteinG) ?? 0,
        targetCarbsG: num(d.targetCarbsG) ?? 0,
        targetFatG: num(d.targetFatG) ?? 0,
      }
    : computed;

  function resetMacros() {
    setD((p) => ({
      ...p, macrosCustomized: false,
      targetCalories: "", targetProteinG: "", targetCarbsG: "", targetFatG: "",
    }));
  }

  function editMacro(k: keyof Draft, v: string) {
    setD((p) => ({
      ...p,
      // İlk elle dokunuşta, o ana kadar gösterilen hesaplanmış değerleri
      // taslağa kopyalıyoruz; yoksa diğer alanlar boş kalırdı.
      ...(p.macrosCustomized || !computed
        ? {}
        : {
            targetCalories: String(computed.targetCalories),
            targetProteinG: String(computed.targetProteinG),
            targetCarbsG: String(computed.targetCarbsG),
            targetFatG: String(computed.targetFatG),
          }),
      [k]: v,
      macrosCustomized: true,
    }));
  }

  async function submit() {
    setError(null);
    if (!shown) {
      setError("Makro hedefleri hesaplanamadı. Adım 2'yi kontrol et.");
      return;
    }

    const measurements =
      num(d.neck) || num(d.arm) || num(d.waist) || num(d.hip)
        ? { neck: num(d.neck), arm: num(d.arm), waist: num(d.waist), hip: num(d.hip) }
        : null;

    const payload: NutritionProfileInput = {
      mealsPerDay: Number(d.mealsPerDay),
      mealTimes: null,
      age: Number(d.age), heightCm: Number(d.heightCm), weightKg: Number(d.weightKg),
      biologicalSex: d.biologicalSex,
      trainingFrequency: d.trainingFrequency!,
      trainingType: d.trainingType ?? "Diğer",
      bodyGoal: d.bodyGoal!,
      bodyFatPercent: num(d.bodyFatPercent),
      measurements,
      targetCalories: Math.round(shown.targetCalories),
      targetProteinG: shown.targetProteinG,
      targetCarbsG: shown.targetCarbsG,
      targetFatG: shown.targetFatG,
      macrosCustomized: d.macrosCustomized,
      bloodType: d.bloodType.trim() || null,
      sugarNeedRate: d.sugarNeedRate.trim() || null,
      lastBloodTestDate: d.lastBloodTestDate.trim() || null,
      bloodTestReminderMonths: null,
    };

    const parsed = nutritionProfileSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Girdiğin bilgilerde bir sorun var.");
      return;
    }

    try {
      await save.mutateAsync(parsed.data);
      // Form sekmenin üstünde açıldığı için geri dönüyoruz. replace ile sekme
      // rotasına gitmek ekranın ikinci bir kopyasını mount ediyor.
      if (router.canGoBack()) router.back();
      else router.replace("/nutrition");
    } catch {
      setError("Kaydedilemedi. Bağlantını kontrol edip tekrar dene.");
    }
  }

  const step2Ready =
    !!num(d.age) && !!num(d.heightCm) && !!num(d.weightKg) && !!d.trainingFrequency && !!d.bodyGoal;

  return (
    <Screen edges={["bottom"]}>
      <ScrollView contentContainerClassName="gap-4 p-4 pb-8">
        <View className="gap-1">
          <Text variant="label" muted>
            ADIM {step} / 5
          </Text>
          <Text variant="displayLg">
            {["Öğün düzeni", "Fiziksel profil", "Makro hedefleri", "Sağlık bilgileri", "Özet"][step - 1]}
          </Text>
        </View>

        {step === 1 ? (
          <Card className="gap-4">
            <ChoiceGroup
              label="Günde kaç öğün?"
              choices={["2", "3", "4", "5", "6"].map((v) => ({ value: v, label: v }))}
              value={d.mealsPerDay}
              onChange={(v) => set("mealsPerDay", v)}
            />
            {Number(d.mealsPerDay) > 3 ? (
              <Text variant="bodySm" muted>
                Öğün saatlerini ve saat bazlı hatırlatmaları daha sonra Beslenme
                ekranından tanımlayabilirsin.
              </Text>
            ) : null}
          </Card>
        ) : null}

        {step === 2 ? (
          <Card className="gap-4">
            <Field label="Yaş" value={d.age} onChangeText={(v) => set("age", v)} keyboardType="number-pad" maxLength={3} />
            <Field label="Boy (cm)" value={d.heightCm} onChangeText={(v) => set("heightCm", v)} keyboardType="decimal-pad" maxLength={5} />
            <Field label="Kilo (kg)" value={d.weightKg} onChangeText={(v) => set("weightKg", v)} keyboardType="decimal-pad" maxLength={5} />
            <ChoiceGroup
              label="Biyolojik cinsiyet"
              optional
              choices={[
                { value: "MALE", label: "Erkek" },
                { value: "FEMALE", label: "Kadın" },
              ]}
              value={d.biologicalSex}
              onChange={(v) => set("biologicalSex", v)}
            />
            <Text variant="bodySm" muted>
              Kalori hesabı bu bilgiye göre değişiyor. Belirtmezsen ortalama bir
              değer kullanılır; sonuç yaklaşık ±83 kcal sapabilir.
            </Text>
            <ChoiceGroup label="Haftalık antrenman" choices={TRAINING_FREQ} value={d.trainingFrequency} onChange={(v) => set("trainingFrequency", v)} />
            <ChoiceGroup label="Antrenman türü" choices={TRAINING_TYPES.map((t) => ({ value: t, label: t }))} value={d.trainingType} onChange={(v) => set("trainingType", v)} />
            <ChoiceGroup label="Hedef" choices={BODY_GOALS} value={d.bodyGoal} onChange={(v) => set("bodyGoal", v)} />
            <Field label="Yağ oranı (%)" optional value={d.bodyFatPercent} onChangeText={(v) => set("bodyFatPercent", v)} keyboardType="decimal-pad" maxLength={4} />
            <View className="flex-row gap-2">
              <View className="flex-1"><Field label="Boyun" optional value={d.neck} onChangeText={(v) => set("neck", v)} keyboardType="decimal-pad" maxLength={5} /></View>
              <View className="flex-1"><Field label="Kol" optional value={d.arm} onChangeText={(v) => set("arm", v)} keyboardType="decimal-pad" maxLength={5} /></View>
            </View>
            <View className="flex-row gap-2">
              <View className="flex-1"><Field label="Bel" optional value={d.waist} onChangeText={(v) => set("waist", v)} keyboardType="decimal-pad" maxLength={5} /></View>
              <View className="flex-1"><Field label="Kalça" optional value={d.hip} onChangeText={(v) => set("hip", v)} keyboardType="decimal-pad" maxLength={5} /></View>
            </View>
          </Card>
        ) : null}

        {step === 3 ? (
          <>
            <Card className="gap-4">
              {!computed ? (
                <Text variant="bodySm" className="text-danger">
                  Önce Adım 2'deki zorunlu alanları doldur.
                </Text>
              ) : (
                <>
                  <View className="gap-1">
                    <Text variant="label" muted>
                      HESAPLANAN
                    </Text>
                    <Text variant="data" muted>
                      BMR {computed.bmr} kcal · TDEE {computed.tdee} kcal
                    </Text>
                  </View>
                  <Field label="Kalori (kcal)" value={d.macrosCustomized ? d.targetCalories : String(computed.targetCalories)} onChangeText={(v) => editMacro("targetCalories", v)} keyboardType="number-pad" maxLength={5} />
                  <Field label="Protein (g)" value={d.macrosCustomized ? d.targetProteinG : String(computed.targetProteinG)} onChangeText={(v) => editMacro("targetProteinG", v)} keyboardType="decimal-pad" maxLength={5} />
                  <Field label="Karbonhidrat (g)" value={d.macrosCustomized ? d.targetCarbsG : String(computed.targetCarbsG)} onChangeText={(v) => editMacro("targetCarbsG", v)} keyboardType="decimal-pad" maxLength={5} />
                  <Field label="Yağ (g)" value={d.macrosCustomized ? d.targetFatG : String(computed.targetFatG)} onChangeText={(v) => editMacro("targetFatG", v)} keyboardType="decimal-pad" maxLength={5} />
                  {d.macrosCustomized ? (
                    <Button title="Varsayılana dön" variant="secondary" onPress={resetMacros} />
                  ) : null}
                </>
              )}
            </Card>
            <Card>
              <Text variant="bodySm" muted>
                {MACRO_DISCLAIMER}
              </Text>
            </Card>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <Card className="gap-4">
              <Field label="Kan grubu" optional value={d.bloodType} onChangeText={(v) => set("bloodType", v)} maxLength={8} placeholder="0 Rh+" />
              <Field label="Şeker ihtiyaç oranı" optional value={d.sugarNeedRate} onChangeText={(v) => set("sugarNeedRate", v)} maxLength={120} hint="Biliyorsan serbestçe yazabilirsin." />
              <Field label="Son kan tahlili tarihi" optional value={d.lastBloodTestDate} onChangeText={(v) => set("lastBloodTestDate", v)} placeholder="2026-01-15" maxLength={10} />
            </Card>
            <Card className="gap-3">
              <Text variant="title">Kan tahlili hatırlatması</Text>
              <Text variant="bodySm" muted>
                Hatırlatma kurmak istersen, yasal uyarıyı da içeren ayrı bir
                adımdan geçeceksin. Anketi bitirdikten sonra da kurabilirsin.
              </Text>
              <Link href="/blood-test-reminder" asChild>
                <Button title="Hatırlatmayı ayarla" variant="secondary" />
              </Link>
            </Card>
          </>
        ) : null}

        {step === 5 ? (
          <Card className="gap-3">
            <Row label="Öğün sayısı" value={d.mealsPerDay} onEdit={() => setStep(1)} />
            <Row label="Yaş / Boy / Kilo" value={`${d.age} · ${d.heightCm} cm · ${d.weightKg} kg`} onEdit={() => setStep(2)} />
            <Row label="Antrenman" value={`${TRAINING_FREQ.find((t) => t.value === d.trainingFrequency)?.label ?? "—"} · ${d.trainingType ?? "—"}`} onEdit={() => setStep(2)} />
            <Row label="Hedef" value={BODY_GOALS.find((b) => b.value === d.bodyGoal)?.label ?? "—"} onEdit={() => setStep(2)} />
            <Row label="Kalori" value={shown ? `${Math.round(shown.targetCalories)} kcal` : "—"} onEdit={() => setStep(3)} />
            <Row label="Makrolar" value={shown ? `P ${shown.targetProteinG} · K ${shown.targetCarbsG} · Y ${shown.targetFatG} g` : "—"} onEdit={() => setStep(3)} />
            <Row label="Kan grubu" value={d.bloodType || "—"} onEdit={() => setStep(4)} />
          </Card>
        ) : null}

        {error ? (
          <Text variant="bodySm" className="text-danger">
            {error}
          </Text>
        ) : null}

        <View className="flex-row gap-2">
          {step > 1 ? (
            <Button title="Geri" variant="secondary" onPress={() => setStep(step - 1)} className="flex-1" />
          ) : null}
          {step < 5 ? (
            <Button
              title="Devam"
              onPress={() => setStep(step + 1)}
              disabled={step === 2 && !step2Ready}
              className="flex-1"
            />
          ) : (
            <Button title="Başla" onPress={submit} loading={save.isPending} className="flex-1" />
          )}
        </View>

        {data?.profile ? (
          <Text variant="bodySm" muted>
            Kayıtlı bir profilin var; kaydettiğinde üzerine yazılır.
          </Text>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <View className="flex-row items-center justify-between gap-3 border-b border-border pb-3">
      <View className="flex-1">
        <Text variant="label" muted>
          {label.toLocaleUpperCase("tr-TR")}
        </Text>
        <Text variant="body">{value}</Text>
      </View>
      <Button title="Düzenle" variant="ghost" onPress={onEdit} />
    </View>
  );
}
