import { router } from "expo-router";
import { Check, ChevronRight, Droplet, Eye, PersonStanding, Wind, type LucideIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Card, Text } from "@/components/ui";
import { useDailyModulesStore } from "@/lib/daily-modules-store";
import { useEyeStrainAnalytics } from "@/lib/eye-strain-queries";
import { usePostureProfile, useTodayBreaks } from "@/lib/posture-queries";
import { useTodaySessions } from "@/lib/stress-queries";
import { useTodayIntake, useWaterGoal } from "@/lib/water-queries";
import { cn } from "@/theme/cn";
import { FeatureTint, type Feature } from "@/theme/feature-theme";
import { touchTarget } from "@/theme/tokens";
import { rgb, usePalette } from "@/theme/use-palette";

interface Item {
  id: string;
  feature: Feature;
  icon: LucideIcon;
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
  const palette = usePalette();
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
      feature: "goz",
      icon: Eye,
      title: "Göz molası ver",
      status: eyeDone ? "Bugün tamamlandı" : "Henüz mola vermedin",
      done: eyeDone,
      href: "/eye",
    },
    {
      id: "water",
      feature: "su",
      icon: Droplet,
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
      feature: "durus",
      icon: PersonStanding,
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
      feature: "nefes",
      icon: Wind,
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
      <View className="flex-row items-baseline justify-between px-5">
        <Text variant="title">Günün önerileri</Text>
        <Text variant="data" muted>
          {doneCount} / {shown.length}
        </Text>
      </View>

      <View className="px-5">
        <Card className="gap-0 p-0">
          {shown.map((item, i) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}: ${item.status}`}
              accessibilityState={{ checked: item.done }}
              onPress={() => router.push(item.href)}
              style={{ minHeight: touchTarget.min }}
              className={cn("px-5 py-3.5", i > 0 && "border-t border-border")}
            >
              {({ pressed }) => (
                <View className="flex-row items-center gap-3" style={{ opacity: pressed ? 0.65 : 1 }}>
                  <FeatureTint feature={item.feature}>
                    <ItemBadge icon={item.icon} done={item.done} />
                  </FeatureTint>
                  <View className="flex-1 gap-0.5">
                    <Text variant="subhead" muted={item.done}>
                      {item.title}
                    </Text>
                    <Text variant="bodySm" muted>
                      {item.status}
                    </Text>
                  </View>
                  <ChevronRight size={18} strokeWidth={1.75} color={rgb(palette.textMuted)} />
                </View>
              )}
            </Pressable>
          ))}
        </Card>
      </View>
    </View>
  );
}

/** Modülün kendi aksanıyla boyanan durum rozeti. */
function ItemBadge({ icon: Icon, done }: { icon: LucideIcon; done: boolean }) {
  const palette = usePalette();

  return (
    <View
      className={cn("items-center justify-center rounded-full", done ? "bg-accent" : "bg-accent/10")}
      style={{ width: 32, height: 32 }}
    >
      {done ? (
        <Check size={16} strokeWidth={2.5} color={rgb(palette.onAccent)} />
      ) : (
        <Icon size={16} strokeWidth={1.75} color={rgb(palette.accent)} />
      )}
    </View>
  );
}
