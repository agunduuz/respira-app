import {
  BREATHING_TECHNIQUES,
  STRESS_ALTERNATIVE_SUGGESTIONS,
  STRESS_LEGAL_NOTICE,
  STRESS_SESSIONS_PER_DAY_PRESETS,
  recommendTechnique,
  type BreathingTechnique,
} from "@respira/shared-types";
import { router } from "expo-router";
import { Bell, HeartPulse, Wind } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { FeatureIntro } from "@/components/FeatureIntro";
import { ChoiceGroup } from "@/components/nutrition/ChoiceGroup";
import { PermissionHint } from "@/components/PermissionHint";
import { Button, Card, Screen, Text } from "@/components/ui";
import { useReminders } from "@/lib/use-reminders";
import { useSaveStressProfile, useStressProfile, useTodaySessions } from "@/lib/stress-queries";
import { useStressIntroStore } from "@/lib/stress-intro-store";

const LEVEL_CHOICES = [
  { value: "1", label: "1 · Sakin" },
  { value: "2", label: "2 · Hafif gergin" },
  { value: "3", label: "3 · Orta" },
  { value: "4", label: "4 · Gergin" },
  { value: "5", label: "5 · Çok gergin" },
] as const;

const TECHNIQUE_ORDER: readonly BreathingTechnique[] = ["DIAPHRAGMATIC", "BOX", "FOUR_SEVEN_EIGHT"];

export default function StressScreen() {
  const { data: profileData } = useStressProfile();
  const profile = profileData?.profile ?? null;
  const { data: sessions } = useTodaySessions(true);
  const saveProfile = useSaveStressProfile();

  const hasSeenIntro = useStressIntroStore((s) => s.hasSeenIntro);
  const introHydrated = useStressIntroStore((s) => s.hydrated);
  useEffect(() => {
    void useStressIntroStore.getState().hydrate();
  }, []);

  const [level, setLevel] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<string | null>(
    profile ? String(profile.desiredSessionsPerDay) : null
  );
  const reminders = useReminders();
  const reminderOn = reminders.isActive("stress");

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


  const today = sessions?.today;

  if (!introHydrated) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator />
      </Screen>
    );
  }

  if (!hasSeenIntro) {
    return (
      <FeatureIntro
        icon={Wind}
        title="Bir nefes molası ver"
        subtitle="Anlık stres seviyeni işaretle, sana uygun tekniği önerelim — istersen doğrudan bir teknik seç."
        benefits={[
          { icon: HeartPulse, title: "Stres seviyeni işaretle", body: "Kısa bir soru, en uygun tekniği önerelim." },
          { icon: Wind, title: "3 farklı teknik", body: "Diyafram nefesi, kutu nefesi ve 4-7-8 tekniği arasından seç." },
          { icon: Bell, title: "Günlük hatırlatma", body: "İstediğin sıklıkta kısa mola hatırlatmaları al." },
        ]}
        ctaLabel="Başlayalım"
        ctaIcon={Wind}
        onPress={() => useStressIntroStore.getState().markSeen()}
      />
    );
  }

  return (
    <Screen edges={["bottom"]}>
      <ScrollView contentContainerClassName="gap-6 p-5 pb-12">
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
            <View className="gap-2 rounded-md bg-accent/10 p-3">
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
            title={reminderOn ? "Hatırlatmalar açık" : "Hatırlatmaları aç"}
            variant={reminderOn ? "secondary" : "primary"}
            onPress={() => void reminders.enable("stress")}
          />
          {reminderOn ? (
            <Button
              title="Hatırlatmaları kapat"
              variant="ghost"
              onPress={() => void reminders.disable("stress")}
            />
          ) : null}
          {reminders.permission === "denied" ? <PermissionHint fallback="Egzersizleri elle başlatabilirsin." /> : null}
        </Card>

        <Text variant="bodySm" muted className="text-center">
          {STRESS_LEGAL_NOTICE}
        </Text>
      </ScrollView>
    </Screen>
  );
}
