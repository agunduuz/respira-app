import { WATER_QUICK_ADD_ML } from "@respira/shared-types";
import { router } from "expo-router";
import { View } from "react-native";

import { ModuleTile } from "@/components/ModuleTile";
import { TabScroll } from "@/components/TabScroll";
import { Text } from "@/components/ui";
import { formatRemaining } from "@/lib/eye-strain-timer";
import { useDayMeals, useNutritionProfile } from "@/lib/nutrition-queries";
import { usePostureProfile, usePostureSession } from "@/lib/posture-queries";
import { useStressIntroStore } from "@/lib/stress-intro-store";
import { useTodaySessions } from "@/lib/stress-queries";
import { useEyeTimerActions, useEyeTimerView } from "@/lib/use-eye-timer";
import { useLogIntake, useTodayIntake, useWaterGoal } from "@/lib/water-queries";

const QUICK_ADD = WATER_QUICK_ADD_ML[0];

const formatLiters = (ml: number) => (ml / 1000).toFixed(1).replace(".", ",");
const todayKey = () => new Date().toISOString().slice(0, 10);

/**
 * Modüller: günün her modülü tek blokta — durum ve en sık eylem yerinde, detay
 * modülün kendi ekranında (docs/01 "Gezinme"). Anasayfadaki plan blokları özet,
 * burası eylem merkezi.
 */
export default function ModulesScreen() {
  const { view } = useEyeTimerView();
  const { start, stop } = useEyeTimerActions();

  const { data: goalData } = useWaterGoal();
  const goal = goalData?.goal ?? null;
  const { data: intake } = useTodayIntake(!!goal);
  const logIntake = useLogIntake();

  const { data: postureProfile } = usePostureProfile();
  const hasPosture = !!postureProfile?.profile;
  const { data: postureSession } = usePostureSession(hasPosture);

  const hasSeenStressIntro = useStressIntroStore((s) => s.hasSeenIntro);
  const { data: stressSessions } = useTodaySessions(true);

  const { data: nutritionData } = useNutritionProfile();
  const nutrition = nutritionData?.profile ?? null;
  const { data: day } = useDayMeals(todayKey());

  const eye = eyeCardProps(view.phase, view.remainingSeconds);
  const totalMl = intake?.totalMl ?? 0;
  const stressToday = stressSessions?.today?.COMPLETED ?? 0;

  return (
    <TabScroll>
      <View className="gap-1 px-1 pt-2">
        <Text variant="bodySm" muted>
          Respira
        </Text>
        <Text variant="headline">Modüller</Text>
      </View>

      <View className="flex-row gap-[10px]">
        <ModuleTile
          className="flex-1"
          tone="bg-t200"
          icon="visibility"
          title="Göz molası"
          status={eye.status}
          actionLabel={eye.actionLabel}
          highlight={view.phase === "breaking"}
          onAction={() => {
            if (view.phase === "breaking") router.push("/eye");
            else if (view.phase === "working") void stop();
            else void start();
          }}
          onPress={() => router.push("/eye")}
        />
        <ModuleTile
          className="flex-1"
          tone="bg-t100"
          icon="water_drop"
          title="Su"
          status={
            goal
              ? `${formatLiters(totalMl)} / ${formatLiters(goal.dailyTargetMl)} L`
              : "Günlük hedefin henüz belirlenmedi"
          }
          actionLabel={goal ? `${QUICK_ADD.label} ekle` : "Hedefi belirle"}
          onAction={() => {
            if (goal) logIntake.mutate({ amountMl: QUICK_ADD.ml });
            else router.push("/water");
          }}
          onPress={() => router.push("/water")}
        />
      </View>

      <View className="flex-row gap-[10px]">
        <ModuleTile
          className="flex-1"
          tone="bg-t400"
          icon="accessibility_new"
          title="Duruş"
          status={
            hasPosture
              ? `Sıradaki set ${postureSession?.minutesPerHourAvailable ?? 5} dakika`
              : "Çalışma şeklini henüz anlatmadın"
          }
          actionLabel={hasPosture ? "Molaya başla" : "Formu doldur"}
          onAction={() =>
            router.push(hasPosture ? { pathname: "/posture", params: { start: "1" } } : "/posture")
          }
          onPress={() => router.push("/posture")}
        />
        <ModuleTile
          className="flex-1"
          tone="bg-t300"
          icon="self_improvement"
          title="Nefes"
          status={
            hasSeenStressIntro && stressToday > 0
              ? `Bugün ${stressToday} egzersiz tamamlandı`
              : "Birkaç dakikalık bir mola"
          }
          actionLabel="Nefes molası"
          onAction={() => router.push("/stress")}
          onPress={() => router.push("/stress")}
        />
      </View>

      <View className="flex-row gap-[10px]">
        <ModuleTile
          className="flex-1"
          tone="bg-t50"
          icon="restaurant"
          title="Beslenme"
          status={
            nutrition
              ? `${day?.summary?.totalCalories ?? 0} / ${nutrition.targetCalories} kcal`
              : "Hedeflerini kurmak için anket"
          }
          actionLabel={nutrition ? "Öğün ekle" : "Ankete başla"}
          onAction={() =>
            router.push(nutrition ? { pathname: "/meal-entry", params: { date: todayKey() } } : "/nutrition-survey")
          }
          onPress={() => router.push("/nutrition")}
        />
        <ModuleTile
          className="flex-1"
          tone="bg-t900"
          icon="bloodtype"
          title="Kan tahlili"
          status="Hatırlatma planla"
          actionLabel="Planla"
          onAction={() => router.push("/blood-test-reminder")}
          onPress={() => router.push("/blood-test-reminder")}
        />
      </View>

      <Text variant="bodySm" muted className="px-1">
        Bu uygulama bir sağlık hizmeti sağlamaz, yalnızca bir hatırlatma aracıdır.
      </Text>
    </TabScroll>
  );
}

function eyeCardProps(phase: string, remainingSeconds: number) {
  if (phase === "breaking") return { status: "Mola zamanı — 6 metre uzağa bak", actionLabel: "Molaya git" };
  if (phase === "working")
    return { status: `Sonraki molaya ${formatRemaining(remainingSeconds)}`, actionLabel: "Sayacı durdur" };
  return { status: "Sayaç duruyor", actionLabel: "Sayacı başlat" };
}
