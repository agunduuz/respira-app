import {
  OCCUPATION_TYPES,
  POSTURE_MINUTE_PRESETS,
  postureProfileSchema,
  type WorkIntensity,
  type WorkStyle,
} from "@respira/shared-types";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";

import { StepFlow } from "@/components/flow/StepFlow";
import { ChoiceGroup } from "@/components/nutrition/ChoiceGroup";
import { Field } from "@/components/nutrition/Field";
import { TimePickerField } from "@/components/nutrition/TimePickerField";
import { Card, Checkbox, Text } from "@/components/ui";
import { usePostureProfile, useSavePostureProfile } from "@/lib/posture-queries";

const WORK_STYLES: readonly { value: WorkStyle; label: string }[] = [
  { value: "SEDENTARY", label: "Masa başı" },
  { value: "STANDING_ACTIVE", label: "Ayakta hareketli" },
  { value: "MIXED", label: "Karma" },
];

const INTENSITIES: readonly { value: WorkIntensity; label: string }[] = [
  { value: "LIGHT", label: "Hafif" },
  { value: "MODERATE", label: "Orta" },
  { value: "HEAVY", label: "Ağır fiziksel" },
];

const STEP_TITLES = ["Nasıl çalışıyorsun?", "Molana ne kadar ayırabilirsin?", "Hatırlatmalar ne zaman gelsin?"];

/** Şema hatasının hangi adımda düzeltileceği. */
const FIELD_STEP: Record<string, number> = {
  workStyle: 1,
  workIntensity: 1,
  occupationType: 1,
  screenHoursPerDay: 2,
  minutesPerHourAvailable: 2,
  workHoursStart: 3,
  workHoursEnd: 3,
};

/** docs/05 onboarding formu — 3 kısa adım. */
export default function PostureFormScreen() {
  const { data } = usePostureProfile();
  const save = useSavePostureProfile();

  const [step, setStep] = useState(1);
  const goBack = useCallback(() => setStep((s) => Math.max(1, s - 1)), []);

  const [workStyle, setWorkStyle] = useState<WorkStyle | null>(null);
  const [intensity, setIntensity] = useState<WorkIntensity | null>(null);
  const [hasScreen, setHasScreen] = useState(false);
  const [screenHours, setScreenHours] = useState("");
  const [occupation, setOccupation] = useState<string | null>(null);
  const [minutes, setMinutes] = useState<number>(5);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");
  const [limitHours, setLimitHours] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sunucudan gelen kayıtlı profili bir kerelik düzenlenebilir yerel forma
    // kopyalıyoruz — react-query verisini forma senkronlamanın standart yolu.
    const p = data?.profile;
    if (!p) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWorkStyle(p.workStyle);
    setIntensity(p.workIntensity);
    setHasScreen((p.screenHoursPerDay ?? 0) > 0);
    setScreenHours(p.screenHoursPerDay ? String(p.screenHoursPerDay) : "");
    setOccupation(p.occupationType);
    setMinutes(p.minutesPerHourAvailable);
    setLimitHours(!!p.workHoursStart && !!p.workHoursEnd);
    if (p.workHoursStart) setStart(p.workHoursStart);
    if (p.workHoursEnd) setEnd(p.workHoursEnd);
  }, [data]);

  async function submit() {
    setError(null);
    const parsed = postureProfileSchema.safeParse({
      workStyle,
      workIntensity: intensity,
      screenHoursPerDay: hasScreen && screenHours.trim() !== "" ? Number(screenHours) : null,
      occupationType: occupation ?? "Diğer",
      minutesPerHourAvailable: minutes,
      workHoursStart: limitHours ? start : null,
      workHoursEnd: limitHours ? end : null,
    });

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setError(issue?.message ?? "Formda eksik veya hatalı alan var.");
      setStep(FIELD_STEP[String(issue?.path[0] ?? "")] ?? 1);
      return;
    }

    try {
      await save.mutateAsync(parsed.data);
      // Form sekmenin üstünde açıldığı için geri dönüyoruz. replace ile sekme
      // rotasına gitmek ekranın ikinci bir kopyasını mount ediyor.
      if (router.canGoBack()) router.back();
      else router.replace("/posture");
    } catch {
      setError("Kaydedilemedi. Bağlantını kontrol edip tekrar dene.");
    }
  }

  const total = STEP_TITLES.length;

  return (
    <StepFlow
      step={step}
      total={total}
      title={STEP_TITLES[step - 1]}
      onBack={goBack}
      onNext={step < total ? () => setStep(step + 1) : submit}
      nextDisabled={step === 1 && (!workStyle || !intensity)}
      loading={save.isPending}
      error={error}
      note={
        step === total ? (
          <Text variant="bodySm" muted>
            Bu öneriler genel ergonomi bilgisidir, tıbbi tavsiye değildir.
          </Text>
        ) : null
      }
    >
      {step === 1 ? (
        <Card className="gap-4">
          <ChoiceGroup label="Çalışma şekli" choices={WORK_STYLES} value={workStyle} onChange={setWorkStyle} />
          <ChoiceGroup label="İş yoğunluğu" choices={INTENSITIES} value={intensity} onChange={setIntensity} />
          <ChoiceGroup
            label="Meslek tipi"
            optional
            choices={OCCUPATION_TYPES.map((o) => ({ value: o, label: o }))}
            value={occupation}
            onChange={setOccupation}
          />
        </Card>
      ) : null}

      {step === 2 ? (
        <>
          <Card className="gap-3">
            <ChoiceGroup
              label="Saat başı ayırabileceğin süre"
              choices={POSTURE_MINUTE_PRESETS.map((m) => ({
                value: String(m),
                label: m === 2 ? "1-2 dk" : m === 5 ? "3-5 dk" : "5+ dk",
              }))}
              value={String(minutes)}
              onChange={(v) => setMinutes(Number(v))}
            />
            <Text variant="bodySm" muted>
              Egzersiz seti bu süreye göre seçilir; verdiğin süreyi aşmaz.
            </Text>
          </Card>

          <Card className="gap-3">
            <Checkbox
              checked={hasScreen}
              onChange={setHasScreen}
              label="Ekran başında zorunlu çalışmam var"
            />
            {hasScreen ? (
              <Field
                label="Günde kaç saat"
                value={screenHours}
                onChangeText={setScreenHours}
                keyboardType="number-pad"
                maxLength={2}
              />
            ) : null}
          </Card>
        </>
      ) : null}

      {step === 3 ? (
        <Card className="gap-3">
          <Checkbox
            checked={limitHours}
            onChange={setLimitHours}
            label="Hatırlatmalar yalnızca mesai saatlerimde gelsin"
          />
          {limitHours ? (
            <View className="flex-row gap-2">
              <View className="flex-1">
                <TimePickerField label="Başlangıç" value={start} onChange={setStart} />
              </View>
              <View className="flex-1">
                <TimePickerField label="Bitiş" value={end} onChange={setEnd} />
              </View>
            </View>
          ) : (
            <Text variant="bodySm" muted>
              Mesai tanımlamazsan hatırlatmalar gün boyu gelebilir.
            </Text>
          )}
        </Card>
      ) : null}
    </StepFlow>
  );
}
