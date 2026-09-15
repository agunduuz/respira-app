import {
  BREATHING_TECHNIQUES,
  STRESS_ALTERNATIVE_SUGGESTIONS,
  STRESS_LEGAL_NOTICE,
  STRESS_SESSIONS_PER_DAY_PRESETS,
  recommendTechnique,
  type BreathingTechnique,
} from "@respira/shared-types";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { ChoiceGroup } from "@/components/nutrition/ChoiceGroup";
import { Button, Card, Screen, Text } from "@/components/ui";
import {
  DEFAULT_QUIET_HOURS,
  cancelCategory,
  ensurePermission,
  scheduleRepeatingReminder,
} from "@/lib/notifications";
import { useSaveStressProfile, useStressProfile, useTodaySessions } from "@/lib/stress-queries";

const LEVEL_CHOICES = [
  { value: "1", label: "1 · Sakin" },
  { value: "2", label: "2" },
  { value: "3", label: "3 · Orta" },
  { value: "4", label: "4" },
  { value: "5", label: "5 · Çok gergin" },
] as const;

const TECHNIQUE_ORDER: readonly BreathingTechnique[] = ["DIAPHRAGMATIC", "BOX", "FOUR_SEVEN_EIGHT"];

export default function StressScreen() {
  const { data: profileData } = useStressProfile();
  const profile = profileData?.profile ?? null;
  const { data: sessions } = useTodaySessions(true);
  const saveProfile = useSaveStressProfile();

  const [level, setLevel] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<string | null>(
    profile ? String(profile.desiredSessionsPerDay) : null
  );
  const [notifyState, setNotifyState] = useState<"idle" | "on" | "denied">("idle");

  const recommended = level ? recommendTechnique(Number(level)) : null;

  function startSession(technique: BreathingTechnique) {
    router.push({
      pathname: "/breathing-session",
      params: { technique, stressLevel: level ?? "" },
    });
  }

  async function saveFrequency(value: string) {
    setFrequency(value);
    await saveProfile.mutateAsync({ desiredSessionsPerDay: Number(value) });
  }

  async function enableReminders() {
    const granted = await ensurePermission();
    if (!granted) {
      setNotifyState("denied");
      return;
    }
    const perDay = frequency ? Number(frequency) : 4;
    const intervalSeconds = Math.round(86400 / perDay);
    await scheduleRepeatingReminder({
      category: "stress",
      title: "Kısa bir mola",
      body: "Birkaç dakikalık bir nefes egzersizi iyi gelebilir.",
      intervalSeconds,
      quietHours: DEFAULT_QUIET_HOURS,
    });
    setNotifyState("on");
  }

  const today = sessions?.today;

  return (
    <Screen edges={["top"]}>
      <ScrollView contentContainerClassName="gap-6 p-4 pb-12">
        <View className="gap-1">
          <Text variant="label" muted>
            STRES
          </Text>
          <Text variant="displayLg">Nasıl hissediyorsun?</Text>
        </View>

        {today ? (
          <Card className="gap-2">
            <Text variant="label" muted>
              BUGÜN
            </Text>
            <View className="flex-row items-baseline gap-2">
              <Text variant="displayXl">{today.COMPLETED}</Text>
              <Text variant="title" muted>
                egzersiz tamamlandı
              </Text>
            </View>
          </Card>
        ) : null}

        <Card className="gap-3">
          <ChoiceGroup
            label="Stres seviyen"
            choices={LEVEL_CHOICES}
            value={level}
            onChange={setLevel}
          />
          {recommended ? (
            <View className="gap-2 rounded-md border border-border-strong bg-elevated p-3">
              <Text variant="label" muted>
                ÖNERİLEN TEKNİK
              </Text>
              <Text variant="title">{BREATHING_TECHNIQUES[recommended].label}</Text>
              <Text variant="bodySm" muted>
                {BREATHING_TECHNIQUES[recommended].instruction}
              </Text>
              <Button title="Egzersize başla" onPress={() => startSession(recommended)} />
            </View>
          ) : null}
        </Card>

        <Card className="gap-3">
          <Text variant="label" muted>
            YA DA DOĞRUDAN SEÇ
          </Text>
          <View className="gap-2">
            {TECHNIQUE_ORDER.map((t) => (
              <Button
                key={t}
                title={BREATHING_TECHNIQUES[t].label}
                variant="secondary"
                onPress={() => startSession(t)}
              />
            ))}
          </View>
        </Card>

        <Card className="gap-3">
          <Text variant="label" muted>
            BAŞKA NE İŞE YARAR
          </Text>
          {STRESS_ALTERNATIVE_SUGGESTIONS.map((s) => (
            <View key={s.id} className="gap-0.5">
              <Text variant="label">{s.title}</Text>
              <Text variant="bodySm" muted>
                {s.description}
              </Text>
            </View>
          ))}
        </Card>

        <Card className="gap-3">
          <Text variant="title">Hatırlatmalar</Text>
          <ChoiceGroup
            label="Günde kaç kez bu tür bir mola almak istersin?"
            choices={STRESS_SESSIONS_PER_DAY_PRESETS.map((p) => ({
              value: String(p.value),
              label: p.label,
            }))}
            value={frequency}
            onChange={saveFrequency}
          />
          <Button
            title={notifyState === "on" ? "Hatırlatmalar açık" : "Hatırlatmaları aç"}
            variant={notifyState === "on" ? "secondary" : "primary"}
            onPress={enableReminders}
          />
          {notifyState === "on" ? (
            <Button
              title="Hatırlatmaları kapat"
              variant="ghost"
              onPress={async () => {
                await cancelCategory("stress");
                setNotifyState("idle");
              }}
            />
          ) : null}
          {notifyState === "denied" ? (
            <Text variant="bodySm" className="text-warm">
              Bildirim izni verilmedi. Egzersizleri elle başlatabilirsin.
            </Text>
          ) : null}
        </Card>

        <Text variant="bodySm" muted className="text-center">
          {STRESS_LEGAL_NOTICE}
        </Text>
      </ScrollView>
    </Screen>
  );
}
