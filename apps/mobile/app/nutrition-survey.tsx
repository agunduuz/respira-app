import {
  MACRO_DISCLAIMER,
  calculateMacroTargets,
  nutritionProfileSchema,
  type BodyGoal,
  type NutritionProfileInput,
  type TrainingFrequency,
} from "@respira/shared-types";
import { router } from "expo-router";
import { PartyPopper } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { View } from "react-native";

import { StepFlow } from "@/components/flow/StepFlow";
import { ChoiceGroup } from "@/components/nutrition/ChoiceGroup";
import { DatePickerField } from "@/components/nutrition/DatePickerField";
import { Field } from "@/components/nutrition/Field";
import { MultiChoiceGroup } from "@/components/nutrition/MultiChoiceGroup";
import { Button, Card, Text } from "@/components/ui";
import { useNutritionProfile, useSaveNutritionProfile } from "@/lib/nutrition-queries";
import { cn } from "@/theme/cn";
import { rgb, usePalette } from "@/theme/use-palette";

const TOTAL_STEPS = 4;
const STEP_TITLES = ["Seni tanıyalım", "Makro hedefleri", "Sağlık bilgileri", "Neredeyse hazırsın!"];

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
  trainingTypes: string[];
  bodyGoal: BodyGoal | null;
  bodyFatPercent: string;
  neck: string; arm: string; waist: string; hip: string;
  targetCalories: string; targetProteinG: string; targetCarbsG: string; targetFatG: string;
  macrosCustomized: boolean;
  bloodType: string; sugarNeedRate: string; lastBloodTestDate: string;
};

const EMPTY: Draft = {
  mealsPerDay: "3", age: "", heightCm: "", weightKg: "", biologicalSex: null,
  trainingFrequency: null, trainingTypes: [], bodyGoal: null,
  bodyFatPercent: "", neck: "", arm: "", waist: "", hip: "",
  targetCalories: "", targetProteinG: "", targetCarbsG: "", targetFatG: "",
  macrosCustomized: false,
  bloodType: "", sugarNeedRate: "", lastBloodTestDate: "",
};

const num = (s: string) => (s.trim() === "" ? null : Number(s));

/** Zod path'in son parçasını (nested `measurements.neck` dahil) ekrandaki alanla eşler. */
const FIELD_META: Record<string, { label: string; step: number }> = {
  mealsPerDay: { label: "Öğün sayısı", step: 1 },
  age: { label: "Yaş", step: 1 },
  heightCm: { label: "Boy", step: 1 },
  weightKg: { label: "Kilo", step: 1 },
  bodyFatPercent: { label: "Yağ oranı", step: 1 },
  neck: { label: "Boyun ölçüsü", step: 1 },
  arm: { label: "Kol ölçüsü", step: 1 },
  waist: { label: "Bel ölçüsü", step: 1 },
  hip: { label: "Kalça ölçüsü", step: 1 },
  trainingType: { label: "Antrenman türü", step: 1 },
  targetCalories: { label: "Kalori", step: 2 },
  targetProteinG: { label: "Protein", step: 2 },
  targetCarbsG: { label: "Karbonhidrat", step: 2 },
  targetFatG: { label: "Yağ", step: 2 },
  bloodType: { label: "Kan grubu", step: 3 },
  sugarNeedRate: { label: "Şeker ihtiyaç oranı", step: 3 },
  lastBloodTestDate: { label: "Son kan tahlili tarihi", step: 3 },
};

/** Zod'un İngilizce "Too big/small" mesajları yerine, alanı ve sınırı adıyla söyleyen bir cümle. */
function friendlyIssueMessage(
  issue: { code: string; maximum?: unknown; minimum?: unknown },
  label: string
): string {
  if (issue.code === "too_big") return `${label} en fazla ${issue.maximum} olabilir.`;
  if (issue.code === "too_small") return `${label} en az ${issue.minimum} olmalı.`;
  if (issue.code === "invalid_type") return `${label} eksik ya da hatalı görünüyor.`;
  return `${label} için girilen değer geçersiz.`;
}

/**
 * docs/04 — 4 adımlı kullanıcı tanıma anketi (eskiden "öğün sayısı" ve
 * "fiziksel profil" ayrı adımlardı; anketi kısaltmak için Adım 1'de
 * birleştirildi).
 *
 * Adımlar tek ekranda state ile ilerliyor (StepFlow kabuğu); her adımdan geri
 * dönülebiliyor ve son adımdaki özetten herhangi bir adıma atlanabiliyor.
 */
export default function NutritionSurveyScreen() {
  const { data } = useNutritionProfile();
  const save = useSaveNutritionProfile();
  const palette = usePalette();

  const [step, setStep] = useState(1);
  const [d, setD] = useState<Draft>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const goBack = useCallback(() => setStep((s) => Math.max(1, s - 1)), []);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setD((p) => ({ ...p, [k]: v }));
    setFieldErrors((prev) => {
      if (!(k in prev)) return prev;
      const next = { ...prev };
      delete next[k as string];
      return next;
    });
  };

  // Antrenman hiç yapılmıyorsa tür seçimi anlamsız — soru kalkar ve önceki
  // seçim temizlenir ki eski bir tür sessizce gönderilmesin.
  function setTrainingFrequency(v: TrainingFrequency) {
    setD((p) => ({ ...p, trainingFrequency: v, trainingTypes: v === "NEVER" ? [] : p.trainingTypes }));
  }

  // Adım 1 tamamsa makrolar canlı hesaplanıyor (docs/04 Adım 2).
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
    setFieldErrors({});
    if (!shown) {
      setError("Makro hedefleri hesaplanamadı. Adım 1'i kontrol et.");
      setStep(1);
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
      trainingType: d.trainingTypes.length ? d.trainingTypes.join(", ") : "Diğer",
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
      const nextFieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path.at(-1) ?? "");
        const meta = FIELD_META[key];
        if (meta) nextFieldErrors[key] = friendlyIssueMessage(issue, meta.label);
      }
      setFieldErrors(nextFieldErrors);

      const firstIssue = parsed.error.issues[0];
      const firstKey = String(firstIssue?.path.at(-1) ?? "");
      const firstMeta = firstIssue ? FIELD_META[firstKey] : undefined;
      setError(firstMeta ? friendlyIssueMessage(firstIssue, firstMeta.label) : "Girdiğin bilgilerde bir sorun var.");
      setStep(firstMeta?.step ?? 1);
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

  const step1Ready =
    !!num(d.age) && !!num(d.heightCm) && !!num(d.weightKg) && !!d.trainingFrequency && !!d.bodyGoal;

  return (
    <StepFlow
      step={step}
      total={TOTAL_STEPS}
      title={STEP_TITLES[step - 1]}
      onBack={goBack}
      onNext={step < TOTAL_STEPS ? () => setStep(step + 1) : submit}
      nextLabel={step < TOTAL_STEPS ? undefined : "Başla"}
      nextDisabled={step === 1 && !step1Ready}
      loading={save.isPending}
      error={error}
      note={
        data?.profile ? (
          <Text variant="bodySm" muted>
            Kayıtlı bir profilin var; kaydettiğinde üzerine yazılır.
          </Text>
        ) : null
      }
    >
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

          <View className="h-px bg-border" />

          <Field label="Yaş" value={d.age} onChangeText={(v) => set("age", v)} keyboardType="number-pad" maxLength={3} error={fieldErrors.age} />
          <Field label="Boy (cm)" value={d.heightCm} onChangeText={(v) => set("heightCm", v)} keyboardType="decimal-pad" maxLength={5} error={fieldErrors.heightCm} />
          <Field label="Kilo (kg)" value={d.weightKg} onChangeText={(v) => set("weightKg", v)} keyboardType="decimal-pad" maxLength={5} error={fieldErrors.weightKg} />
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
          <ChoiceGroup
            label="Haftalık antrenman"
            choices={TRAINING_FREQ}
            value={d.trainingFrequency}
            onChange={setTrainingFrequency}
          />
          {d.trainingFrequency && d.trainingFrequency !== "NEVER" ? (
            <MultiChoiceGroup
              label="Antrenman türü"
              optional
              hint="Birden fazla seçebilirsin."
              choices={TRAINING_TYPES.map((t) => ({ value: t, label: t }))}
              value={d.trainingTypes}
              onChange={(v) => set("trainingTypes", v)}
            />
          ) : null}
          <ChoiceGroup label="Hedef" choices={BODY_GOALS} value={d.bodyGoal} onChange={(v) => set("bodyGoal", v)} />
          <Field label="Yağ oranı (%)" optional value={d.bodyFatPercent} onChangeText={(v) => set("bodyFatPercent", v)} keyboardType="decimal-pad" maxLength={4} error={fieldErrors.bodyFatPercent} />
          <View className="flex-row gap-2">
            <View className="flex-1"><Field label="Boyun" optional value={d.neck} onChangeText={(v) => set("neck", v)} keyboardType="decimal-pad" maxLength={5} error={fieldErrors.neck} /></View>
            <View className="flex-1"><Field label="Kol" optional value={d.arm} onChangeText={(v) => set("arm", v)} keyboardType="decimal-pad" maxLength={5} error={fieldErrors.arm} /></View>
          </View>
          <View className="flex-row gap-2">
            <View className="flex-1"><Field label="Bel" optional value={d.waist} onChangeText={(v) => set("waist", v)} keyboardType="decimal-pad" maxLength={5} error={fieldErrors.waist} /></View>
            <View className="flex-1"><Field label="Kalça" optional value={d.hip} onChangeText={(v) => set("hip", v)} keyboardType="decimal-pad" maxLength={5} error={fieldErrors.hip} /></View>
          </View>
        </Card>
      ) : null}

      {step === 2 ? (
        <>
          <Card className="gap-4">
            {!computed ? (
              <Text variant="bodySm" className="text-danger">
                Önce Adım 1&apos;deki zorunlu alanları doldur.
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
                <Field label="Kalori (kcal)" value={d.macrosCustomized ? d.targetCalories : String(computed.targetCalories)} onChangeText={(v) => editMacro("targetCalories", v)} keyboardType="number-pad" maxLength={5} error={fieldErrors.targetCalories} />
                <Field label="Protein (g)" value={d.macrosCustomized ? d.targetProteinG : String(computed.targetProteinG)} onChangeText={(v) => editMacro("targetProteinG", v)} keyboardType="decimal-pad" maxLength={5} error={fieldErrors.targetProteinG} />
                <Field label="Karbonhidrat (g)" value={d.macrosCustomized ? d.targetCarbsG : String(computed.targetCarbsG)} onChangeText={(v) => editMacro("targetCarbsG", v)} keyboardType="decimal-pad" maxLength={5} error={fieldErrors.targetCarbsG} />
                <Field label="Yağ (g)" value={d.macrosCustomized ? d.targetFatG : String(computed.targetFatG)} onChangeText={(v) => editMacro("targetFatG", v)} keyboardType="decimal-pad" maxLength={5} error={fieldErrors.targetFatG} />
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

      {step === 3 ? (
        <>
          <Card className="gap-4">
            <Field label="Kan grubu" optional value={d.bloodType} onChangeText={(v) => set("bloodType", v)} maxLength={8} placeholder="0 Rh+" error={fieldErrors.bloodType} />
            <Field
              label="Şeker ihtiyaç oranı"
              optional
              value={d.sugarNeedRate}
              onChangeText={(v) => set("sugarNeedRate", v)}
              maxLength={120}
              placeholder="ör. 1 ünite / 10g karbonhidrat"
              hint="Diyabet takibi yapanlar için — doktorunun sana verdiği insülin/karbonhidrat oranını biliyorsan buraya yazabilirsin. Bilmiyorsan boş bırak."
              error={fieldErrors.sugarNeedRate}
            />
            <DatePickerField
              label="Son kan tahlili tarihi"
              optional
              value={d.lastBloodTestDate}
              onChange={(v) => set("lastBloodTestDate", v)}
              error={fieldErrors.lastBloodTestDate}
            />
          </Card>
          <Card className="gap-2">
            <Text variant="title">Kan tahlili hatırlatması</Text>
            <Text variant="bodySm" muted>
              Anketi bitirip profilini kaydettikten sonra, Ayarlar &gt; Kan
              tahlili&apos;nden yasal uyarıyı onaylayıp hatırlatma kurabilirsin.
            </Text>
          </Card>
        </>
      ) : null}

      {step === 4 ? (
        <>
          <View className="flex-row items-center gap-2 px-1">
            <PartyPopper size={20} strokeWidth={1.75} color={rgb(palette.accent)} />
            <Text variant="bodySm" muted>
              Son adım — göz atıp onayla, Beslenme takibin hemen başlasın.
            </Text>
          </View>
          <Card className="gap-3">
            <Row label="Öğün sayısı" value={d.mealsPerDay} onEdit={() => setStep(1)} />
            <Row label="Yaş / Boy / Kilo" value={`${d.age} · ${d.heightCm} cm · ${d.weightKg} kg`} onEdit={() => setStep(1)} />
            <Row label="Antrenman" value={`${TRAINING_FREQ.find((t) => t.value === d.trainingFrequency)?.label ?? "—"} · ${d.trainingTypes.length ? d.trainingTypes.join(", ") : "—"}`} onEdit={() => setStep(1)} />
            <Row label="Hedef" value={BODY_GOALS.find((b) => b.value === d.bodyGoal)?.label ?? "—"} onEdit={() => setStep(1)} />
            <Row label="Kalori" value={shown ? `${Math.round(shown.targetCalories)} kcal` : "—"} onEdit={() => setStep(2)} />
            <Row label="Makrolar" value={shown ? `P ${shown.targetProteinG} · K ${shown.targetCarbsG} · Y ${shown.targetFatG} g` : "—"} onEdit={() => setStep(2)} />
            <Row label="Kan grubu" value={d.bloodType || "—"} onEdit={() => setStep(3)} last />
          </Card>
        </>
      ) : null}
    </StepFlow>
  );
}

function Row({ label, value, onEdit, last }: { label: string; value: string; onEdit: () => void; last?: boolean }) {
  return (
    <View className={cn("flex-row items-center justify-between gap-3 pb-3", !last && "border-b border-border")}>
      <View className="flex-1">
        <Text variant="bodySm" muted>
          {label}
        </Text>
        <Text variant="body">{value}</Text>
      </View>
      <Button title="Düzenle" variant="ghost" onPress={onEdit} />
    </View>
  );
}
