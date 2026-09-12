import {
  OCCUPATION_TYPES,
  POSTURE_MINUTE_PRESETS,
  postureProfileSchema,
  type WorkIntensity,
  type WorkStyle,
} from "@respira/shared-types";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

import { ChoiceGroup } from "@/components/nutrition/ChoiceGroup";
import { Field } from "@/components/nutrition/Field";
import { Button, Card, Checkbox, Screen, Text } from "@/components/ui";
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

/** docs/05 onboarding formu. */
export default function PostureFormScreen() {
  const { data } = usePostureProfile();
  const save = useSavePostureProfile();

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
    const p = data?.profile;
    if (!p) return;
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
      setError(parsed.error.issues[0]?.message ?? "Formda eksik veya hatalı alan var.");
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

  return (
    <Screen edges={["bottom"]}>
      <ScrollView contentContainerClassName="gap-4 p-4 pb-8">
        <Card className="gap-4">
          <Text variant="title">Çalışma şeklin</Text>
          <ChoiceGroup label="Çalışma şekli" choices={WORK_STYLES} value={workStyle} onChange={setWorkStyle} />
          <ChoiceGroup label="İş yoğunluğu" choices={INTENSITIES} value={intensity} onChange={setIntensity} />
          <ChoiceGroup
            label="Meslek tipi"
            choices={OCCUPATION_TYPES.map((o) => ({ value: o, label: o }))}
            value={occupation}
            onChange={setOccupation}
          />
        </Card>

        <Card className="gap-3">
          <Text variant="title">Ekran başında çalışma</Text>
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

        <Card className="gap-3">
          <Text variant="title">Saat başı kendine ne kadar ayırabilirsin?</Text>
          <ChoiceGroup
            label="Süre"
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
          <Text variant="title">Mesai saatleri</Text>
          <Checkbox
            checked={limitHours}
            onChange={setLimitHours}
            label="Hatırlatmalar yalnızca mesai saatlerimde gelsin"
          />
          {limitHours ? (
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Field label="Başlangıç" value={start} onChangeText={setStart} maxLength={5} placeholder="09:00" />
              </View>
              <View className="flex-1">
                <Field label="Bitiş" value={end} onChangeText={setEnd} maxLength={5} placeholder="18:00" />
              </View>
            </View>
          ) : (
            <Text variant="bodySm" muted>
              Mesai tanımlamazsan hatırlatmalar gün boyu gelebilir.
            </Text>
          )}
        </Card>

        {error ? (
          <Text variant="bodySm" className="text-danger">
            {error}
          </Text>
        ) : null}

        <Button title="Kaydet" onPress={submit} loading={save.isPending} />

        <Text variant="bodySm" muted>
          Bu öneriler genel ergonomi bilgisidir, tıbbi tavsiye değildir.
        </Text>
      </ScrollView>
    </Screen>
  );
}
