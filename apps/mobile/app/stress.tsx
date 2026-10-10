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
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

import { BreathingOrb } from "@/components/BreathingOrb";
import { FeatureIntro } from "@/components/FeatureIntro";
import { ChoiceGroup } from "@/components/nutrition/ChoiceGroup";
import { PermissionHint } from "@/components/PermissionHint";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Button, Icon, Screen, Text } from "@/components/ui";
import { cn } from "@/theme/cn";
import { useReminders } from "@/lib/use-reminders";
import { useSaveStressProfile, useStressProfile, useTodaySessions } from "@/lib/stress-queries";
import { useStressIntroStore } from "@/lib/stress-intro-store";

const LEVELS = [
  { value: "1", label: "Sakin" },
  { value: "2", label: "Hafif gergin" },
  { value: "3", label: "Orta" },
  { value: "4", label: "Gergin" },
  { value: "5", label: "Çok gergin" },
] as const;

const TECHNIQUE_SHORT: Record<BreathingTechnique, string> = {
  DIAPHRAGMATIC: "Diyafram",
  BOX: "Kutu",
  FOUR_SEVEN_EIGHT: "4-7-8",
};

/** Alternatif önerilerin blok tonu ve ikonu (Lavanta Blok: yürüyüş/germe/farkındalık). */
const ALT_STYLE: Record<string, { icon: string; tone: string }> = {
  walk: { icon: "directions_walk", tone: "bg-t200" },
  stretch: { icon: "sports_gymnastics", tone: "bg-t100" },
  mindfulness: { icon: "spa", tone: "bg-t400" },
};

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
  // Kullanıcı bir teknik seçmediyse önerilen (ya da ilk) teknik gösterilir.
  const [picked, setPicked] = useState<BreathingTechnique | null>(null);
  const technique: BreathingTechnique = picked ?? recommended ?? "DIAPHRAGMATIC";
  const def = BREATHING_TECHNIQUES[technique];
  const levelLabel = level ? LEVELS.find((l) => l.value === level)?.label : null;

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
    <View className="flex-1 bg-t300">
      <Screen transparent edges={["top", "bottom"]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-[18px] px-5 pb-10 pt-2">
          <ScreenHeader
            variant="light"
            right={
              levelLabel ? (
                <View className="rounded-[14px] bg-t900 px-[14px] py-[7px]">
                  <Text variant="label" className="text-white">
                    Stres: {levelLabel.toLocaleLowerCase("tr-TR")} · {level}/5
                  </Text>
                </View>
              ) : undefined
            }
          />

          <View className="gap-[6px]">
            <Text variant="displayLg" className="text-[36px] leading-[45px]">
              Nefesine dön
            </Text>
            <Text variant="body" className="font-bodyMedium">
              {def.label} · {def.instruction}
            </Text>
          </View>

          {/* Stres seviyesi */}
          <View className="gap-2" accessibilityRole="radiogroup" accessibilityLabel="Stres seviyen">
            <Text variant="subhead">Şu an ne kadar gergin hissediyorsun?</Text>
            <View className="flex-row flex-wrap gap-2">
              {LEVELS.map((l) => {
                const selected = l.value === level;
                return (
                  <Pressable
                    key={l.value}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${l.value}, ${l.label}`}
                    onPress={() => {
                      setLevel(l.value);
                      setPicked(null);
                    }}
                    style={{ minHeight: 44 }}
                    className={cn("items-center justify-center rounded-full px-4 active:scale-[0.96]", selected ? "bg-t900" : "bg-white")}
                  >
                    <Text variant="subhead" className={selected ? "text-white" : "text-t900"}>
                      {l.value} · {l.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Teknik seçici */}
          <View className="flex-row gap-2" accessibilityRole="radiogroup" accessibilityLabel="Nefes tekniği">
            {TECHNIQUE_ORDER.map((t) => {
              const selected = t === technique;
              return (
                <Pressable
                  key={t}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${BREATHING_TECHNIQUES[t].label}${t === recommended ? ", önerilen" : ""}`}
                  onPress={() => setPicked(t)}
                  style={{ height: 44 }}
                  className={cn("flex-1 flex-row items-center justify-center gap-1 rounded-full active:scale-[0.96]", selected ? "bg-t900" : "bg-white")}
                >
                  <Text variant="subhead" className={cn("text-[14px]", selected ? "text-white" : "text-t900")}>
                    {TECHNIQUE_SHORT[t]}
                  </Text>
                  {t === recommended ? <Icon name="auto_awesome" size={14} className={selected ? "text-white" : "text-t900"} /> : null}
                </Pressable>
              );
            })}
          </View>

          <View className="items-center">
            <BreathingOrb phases={def.phases} running={false}>
              <Text variant="displayLg" className="text-[26px]">
                Hazır
              </Text>
              <Text variant="label" className="text-[15px] font-heavy">
                {Math.round(def.sessionDurationSeconds / 60)} dk
              </Text>
            </BreathingOrb>
          </View>

          {recommended ? (
            <Text variant="bodySm" className="text-center font-bodySemiBold">
              Seviyene göre önerilen teknik: {BREATHING_TECHNIQUES[recommended].label}
            </Text>
          ) : null}

          <Button title="Egzersize başla" onPress={() => startSession(technique)} />

          {today ? (
            <View className="flex-row items-baseline gap-2 rounded-card bg-white/55 px-4 py-3">
              <Text variant="displayLg" className="text-[28px]">
                {today.COMPLETED}
              </Text>
              <Text variant="subhead">egzersiz bugün tamamlandı</Text>
            </View>
          ) : null}

          {/* Başka ne işe yarar */}
          <View className="gap-2">
            <Text variant="subhead">Başka ne işe yarar</Text>
            <View className="flex-row gap-2">
              {STRESS_ALTERNATIVE_SUGGESTIONS.map((sug) => {
                const style = ALT_STYLE[sug.id] ?? { icon: "spa", tone: "bg-t200" };
                return (
                  <View key={sug.id} className={cn("flex-1 gap-[6px] rounded-tile px-3 py-[14px]", style.tone)}>
                    <Icon name={style.icon} size={24} className="text-t900" />
                    <Text variant="subhead" className="text-[14px] leading-[18px]">
                      {sug.title}
                    </Text>
                  </View>
                );
              })}
            </View>
            <Text variant="bodySm" className="font-bodyMedium">
              {STRESS_ALTERNATIVE_SUGGESTIONS.map((sug) => sug.description).join(" ")}
            </Text>
          </View>

          {/* Hatırlatmalar */}
          <View className="gap-3 rounded-card bg-white p-4">
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
              className={reminderOn ? "border-[1.5px] border-line" : undefined}
              onPress={() => void reminders.enable("stress")}
            />
            {reminderOn ? (
              <Button title="Hatırlatmaları kapat" variant="ghost" onPress={() => void reminders.disable("stress")} />
            ) : null}
            {reminders.permission === "denied" ? <PermissionHint fallback="Egzersizleri elle başlatabilirsin." /> : null}
          </View>

          <Text variant="bodySm" className="px-1 text-center font-bodyMedium">
            {STRESS_LEGAL_NOTICE}
          </Text>
        </ScrollView>
      </Screen>
    </View>
  );
}
