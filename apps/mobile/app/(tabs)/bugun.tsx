import { WATER_QUICK_ADD_ML } from "@respira/shared-types";
import { router } from "expo-router";
import { Droplet, Eye, PersonStanding, Wind } from "lucide-react-native";
import { ScrollView, View } from "react-native";

import { Card, Screen, Text } from "@/components/ui";
import { TodayCard } from "@/components/TodayCard";
import { formatRemaining } from "@/lib/eye-strain-timer";
import { usePostureProfile, usePostureSession } from "@/lib/posture-queries";
import { useStressIntroStore } from "@/lib/stress-intro-store";
import { useTodaySessions } from "@/lib/stress-queries";
import { useEyeTimerActions, useEyeTimerView } from "@/lib/use-eye-timer";
import { useLogIntake, useTodayIntake, useWaterGoal } from "@/lib/water-queries";

const QUICK_ADD = WATER_QUICK_ADD_ML[0];

const formatLiters = (ml: number) => (ml / 1000).toFixed(1).replace(".", ",");

/**
 * Günün özeti. Göz, Su, Duruş ve Nefes aynı türde modüller — gün boyu
 * hatırlatma verip tek dokunuşluk eylem isteyen. Hepsi burada bir satır;
 * detay her modülün kendi ekranında (docs/01 "Gezinme").
 */
export default function TodayScreen() {
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

  const eye = eyeCardProps(view.phase, view.remainingSeconds);
  const totalMl = intake?.totalMl ?? 0;
  const stressToday = stressSessions?.today?.COMPLETED ?? 0;

  return (
    <Screen edges={["top"]}>
      <ScrollView contentContainerClassName="gap-6 p-5 pb-12">
        <View className="gap-1">
          <Text variant="label" muted>
            RESPİRA
          </Text>
          <Text variant="displayLg">Bugün</Text>
        </View>

        <Card className="gap-0 p-0">
          <TodayCard
            feature="goz"
            icon={Eye}
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

          <TodayCard
            feature="su"
            icon={Droplet}
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

          <TodayCard
            feature="durus"
            icon={PersonStanding}
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

          <TodayCard
            feature="nefes"
            icon={Wind}
            title="Nefes"
            status={
              hasSeenStressIntro && stressToday > 0
                ? `Bugün ${stressToday} egzersiz tamamlandı`
                : "Birkaç dakikalık bir mola"
            }
            actionLabel="Nefes molası ver"
            onAction={() => router.push("/stress")}
            onPress={() => router.push("/stress")}
            last
          />
        </Card>

        <Text variant="bodySm" muted>
          Bu uygulama bir sağlık hizmeti sağlamaz, yalnızca bir hatırlatma aracıdır.
        </Text>
      </ScrollView>
    </Screen>
  );
}

function eyeCardProps(phase: string, remainingSeconds: number) {
  if (phase === "breaking") return { status: "Mola zamanı — 6 metre uzağa bak", actionLabel: "Molaya git" };
  if (phase === "working")
    return { status: `Sonraki molaya ${formatRemaining(remainingSeconds)}`, actionLabel: "Sayacı durdur" };
  return { status: "Sayaç duruyor", actionLabel: "Sayacı başlat" };
}
