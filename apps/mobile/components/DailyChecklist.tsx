import { router } from "expo-router";
import { Pressable, View } from "react-native";

import { Icon, Text } from "@/components/ui";
import { useDailyModulesStore } from "@/lib/daily-modules-store";
import { useEyeStrainAnalytics } from "@/lib/eye-strain-queries";
import { usePostureProfile, useTodayBreaks } from "@/lib/posture-queries";
import { useTodaySessions } from "@/lib/stress-queries";
import { useTodayIntake, useWaterGoal } from "@/lib/water-queries";
import { cn } from "@/theme/cn";
import { touchTarget } from "@/theme/tokens";

interface Item {
  id: string;
  /** Material Symbols adı. */
  icon: string;
  /** Rozet tonu — modülün bloğuyla aynı. */
  tone: string;
  title: string;
  status: string;
  done: boolean;
  href: "/eye" | "/water" | "/posture" | "/stress";
}

/**
 * Günün önerileri: her modülden günde en az bir kez yapılması iyi olan şey.
 * Durum gerçek veriden geliyor — tamamlanan işaretleniyor, kalanlar ilgili
 * ekrana götürüyor. Kullanıcıyı zorlamak için değil, unutmamak için.
 */
export function DailyChecklist() {
  const enabled = useDailyModulesStore((s) => s.enabled);
  const { data: analytics } = useEyeStrainAnalytics("daily");
  const { data: goalData } = useWaterGoal();
  const goal = goalData?.goal ?? null;
  const { data: intake } = useTodayIntake(!!goal);
  const { data: postureProfile } = usePostureProfile();
  const hasPosture = !!postureProfile?.profile;
  const { data: breaks } = useTodayBreaks(hasPosture);
  const { data: stressSessions } = useTodaySessions(true);

  const totalMl = intake?.totalMl ?? 0;
  const targetMl = goal?.dailyTargetMl ?? 0;
  const eyeDone = (analytics?.totals.completed ?? 0) > 0;
  const waterDone = !!goal && totalMl >= targetMl;
  const postureDone = (breaks?.today.COMPLETED ?? 0) > 0;
  const breathDone = (stressSessions?.today?.COMPLETED ?? 0) > 0;

  const items: Item[] = [
    {
      id: "eye",
      icon: "visibility",
      tone: "bg-t200",
      title: "Göz molası ver",
      status: eyeDone ? "Bugün tamamlandı" : "Henüz mola vermedin",
      done: eyeDone,
      href: "/eye",
    },
    {
      id: "water",
      icon: "water_drop",
      tone: "bg-t100",
      title: "Su hedefini tamamla",
      status: !goal
        ? "Önce günlük hedefini belirle"
        : waterDone
          ? "Hedefine ulaştın"
          : `${Math.max(0, targetMl - totalMl)} ml kaldı`,
      done: waterDone,
      href: "/water",
    },
    {
      id: "posture",
      icon: "accessibility_new",
      tone: "bg-t400",
      title: "Duruş molası ver",
      status: !hasPosture
        ? "Önce çalışma şeklini anlat"
        : postureDone
          ? "Bugün tamamlandı"
          : "Kısa bir set seni bekliyor",
      done: postureDone,
      href: "/posture",
    },
    {
      id: "stress",
      icon: "self_improvement",
      tone: "bg-t300",
      title: "Nefes egzersizi yap",
      status: breathDone ? "Bugün tamamlandı" : "Birkaç dakika yeter",
      done: breathDone,
      href: "/stress",
    },
  ];

  const shown = items.filter((i) => enabled[i.id as keyof typeof enabled]);
  if (shown.length === 0) return null;

  const doneCount = shown.filter((i) => i.done).length;

  return (
    <View className="gap-3">
      <View className="flex-row items-baseline justify-between">
        <Text variant="section">Günün önerileri</Text>
        <Text variant="data" muted>
          {doneCount} / {shown.length}
        </Text>
      </View>

      <View className="gap-2">
        {shown.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}: ${item.status}`}
            accessibilityState={{ checked: item.done }}
            onPress={() => router.push(item.href)}
            style={{ minHeight: touchTarget.min }}
            className="flex-row items-center gap-3 rounded-card bg-white py-3 pl-3 pr-4 active:scale-[0.98]"
          >
            <View
              className={cn("items-center justify-center rounded-full", item.done ? "bg-t900" : item.tone)}
              style={{ width: 44, height: 44 }}
            >
              <Icon name={item.done ? "check" : item.icon} size={22} className={item.done ? "text-white" : "text-t900"} />
            </View>
            <View className="flex-1 gap-0.5">
              <Text variant="subhead" muted={item.done}>
                {item.title}
              </Text>
              <Text variant="caption" muted>
                {item.status}
              </Text>
            </View>
            <Icon name="chevron_right" size={24} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
