import { WATER_QUICK_ADD_ML } from "@respira/shared-types";
import { router } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

import { DailyChecklist } from "@/components/DailyChecklist";
import { InfoTip } from "@/components/InfoTip";
import { Rings } from "@/components/Rings";
import { TabScroll } from "@/components/TabScroll";
import { Icon, IconButton, Text } from "@/components/ui";
import { useMonthlyActivity } from "@/lib/activity-queries";
import { useAuthStore } from "@/lib/auth-store";
import { DISCOVER_ITEMS, formatToday, greeting, type DiscoverItem } from "@/lib/discover";
import { useEyeStrainAnalytics } from "@/lib/eye-strain-queries";
import { formatRemaining } from "@/lib/eye-strain-timer";
import { useDayMeals, useNutritionProfile } from "@/lib/nutrition-queries";
import { usePostureProfile, usePostureSession } from "@/lib/posture-queries";
import { EYE_TIPS, WATER_TIPS, tipOfTheDay } from "@/lib/tips";
import { useEyeTimerView } from "@/lib/use-eye-timer";
import { useLogIntake, useTodayIntake, useWaterGoal } from "@/lib/water-queries";
import { cn } from "@/theme/cn";
import { rgb, usePalette } from "@/theme/use-palette";

const ALL_TIPS = [...EYE_TIPS, ...WATER_TIPS];
const QUICK_ADD = WATER_QUICK_ADD_ML[0];
const WEEKDAYS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"] as const;

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fmt = (n: number) => Math.round(n).toLocaleString("tr-TR");
const pct = (v: number, t: number) => (t > 0 ? Math.min(100, Math.round((v / t) * 100)) : 0);

/** Pazartesi'den başlayan içinde bulunulan hafta. */
function currentWeek(today = new Date()): Date[] {
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

/**
 * Anasayfa (Lavanta Blok "Bugün"): üç halkalı günlük özet, hafta şeridi ve
 * modüllerin bloklara ayrılmış günlük planı. Tasarımın dışındaki mevcut özellikler
 * (günün önerileri, günün notu, keşfet) aynı blok diliyle altta durur.
 */
export default function HomeScreen() {
  const palette = usePalette();
  const email = useAuthStore((s) => s.session?.user?.email ?? "");
  const name = email.split("@")[0] || "sen";
  const displayName = name.charAt(0).toLocaleUpperCase("tr-TR") + name.slice(1);
  const initials = name.slice(0, 2).toLocaleUpperCase("tr-TR");

  const { view } = useEyeTimerView();
  const { data: eyeDay } = useEyeStrainAnalytics("daily");
  const eyeDone = eyeDay?.totals.completed ?? 0;
  const eyeSkipped = eyeDay?.totals.skipped ?? 0;
  const eyePct = Math.round((eyeDay?.totals.complianceRate ?? 0) * 100);

  const { data: goalData } = useWaterGoal();
  const goal = goalData?.goal ?? null;
  const { data: intake } = useTodayIntake(!!goal);
  const logIntake = useLogIntake();
  const waterMl = intake?.totalMl ?? 0;
  const waterTarget = goal?.dailyTargetMl ?? 0;
  const waterPct = pct(waterMl, waterTarget);

  const { data: nutritionData } = useNutritionProfile();
  const nutrition = nutritionData?.profile ?? null;
  const today = dateKey(new Date());
  const { data: day } = useDayMeals(today);
  const kcal = day?.summary?.totalCalories ?? 0;
  const kcalTarget = nutrition?.targetCalories ?? 0;
  const kcalPct = pct(kcal, kcalTarget);
  const macroPct = nutrition
    ? [
        { l: "K", v: pct(day?.summary?.totalCarbsG ?? 0, nutrition.targetCarbsG), bg: "bg-t500" },
        { l: "P", v: pct(day?.summary?.totalProteinG ?? 0, nutrition.targetProteinG), bg: "bg-t300" },
        { l: "Y", v: pct(day?.summary?.totalFatG ?? 0, nutrition.targetFatG), bg: "bg-t200" },
      ]
    : [];

  const { data: postureProfile } = usePostureProfile();
  const hasPosture = !!postureProfile?.profile;
  const { data: postureSession } = usePostureSession(hasPosture);

  const week = currentWeek();
  const { data: activity } = useMonthlyActivity(today.slice(0, 7));
  const activeDays = new Set(
    (activity?.days ?? [])
      .filter((d) => d.eyeCompleted + d.postureCompleted + d.breathingCompleted + d.meals > 0 || d.waterMl > 0)
      .map((d) => d.date)
  );

  const eyeLine =
    view.phase === "working"
      ? { big: formatRemaining(view.remainingSeconds), small: "sonraki molaya" }
      : view.phase === "breaking"
        ? { big: "Şimdi", small: "6 metre uzağa bak" }
        : { big: "Hazır", small: "sayacı başlat" };

  return (
    <TabScroll>
      {/* Üst satır: avatar · selamlama · ayarlar */}
      <View className="flex-row items-center justify-between">
        <View className="h-[50px] w-[50px] items-center justify-center rounded-full bg-t300">
          <Text variant="title" className="font-black text-[17px]">
            {initials}
          </Text>
        </View>
        <View className="items-center">
          <Text variant="title" className="text-[18px]">
            {greeting()}, {displayName}
          </Text>
          <Text variant="bodySm" muted>
            {formatToday()}
          </Text>
        </View>
        <IconButton icon="settings" label="Ayarlar" onPress={() => router.push("/settings")} />
      </View>

      {/* Günlük halkalar */}
      <View className="flex-row items-center gap-[10px] rounded-blockLg bg-t300 py-[22px] pl-[22px] pr-5">
        <View className="flex-1 gap-[10px]">
          <Text variant="displayLg" className="text-[32px] leading-[40px]">
            {"Günlük\nhalkalar"}
          </Text>
          <Text variant="bodySm" className="font-bodyMedium text-t900">
            Göz, su ve beslenme hedeflerin
          </Text>
          <View className="mt-1 gap-[5px]">
            <Legend color="bg-t900" label={`Göz %${eyePct}`} />
            <Legend color="bg-white" label={`Su %${waterPct}`} />
            <Legend color="bg-t600" label={`Kalori %${kcalPct}`} />
          </View>
        </View>
        <Rings
          size={148}
          strokeWidth={14}
          trackColor="rgba(30,24,48,.12)"
          rings={[
            { r: 64, value: eyePct / 100, color: rgb(palette.t900) },
            { r: 47, value: waterPct / 100, color: "#FFFFFF" },
            { r: 30, value: kcalPct / 100, color: rgb(palette.t600) },
          ]}
        />
      </View>

      {/* Hafta şeridi */}
      <View className="flex-row gap-[6px]">
        {week.map((d) => {
          const key = dateKey(d);
          const isToday = key === today;
          const isFuture = key > today;
          return (
            <View
              key={key}
              accessibilityLabel={`${d.getDate()} ${WEEKDAYS[d.getDay()]}${isToday ? ", bugün" : ""}`}
              className={cn(
                "h-[66px] flex-1 items-center justify-center gap-px rounded-full",
                isToday ? "bg-t900" : "border-[1.5px] border-line"
              )}
            >
              {!isFuture && (isToday || activeDays.has(key)) ? (
                <View className={cn("h-[5px] w-[5px] rounded-full", isToday ? "bg-white" : "bg-t900")} />
              ) : (
                <View className="h-[5px]" />
              )}
              <Text variant="caption" className={cn("font-bodyMedium", isToday ? "text-white" : "text-mut")}>
                {WEEKDAYS[d.getDay()]}
              </Text>
              <Text variant="subhead" className={cn("font-black", isToday ? "text-white" : "text-t900")}>
                {d.getDate()}
              </Text>
            </View>
          );
        })}
      </View>

      <Text variant="section" className="mt-1">
        Bugünün planı
      </Text>

      {/* Plan blokları */}
      <View className="flex-row gap-[10px]">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Göz molası, ${eyeLine.small}`}
          onPress={() => router.push("/eye")}
          className="flex-[1.1] gap-[10px] rounded-block bg-t200 p-[18px]"
        >
          <View className="self-start rounded-[12px] bg-white/55 px-[11px] py-[5px]">
            <Text variant="caption">20-20-20</Text>
          </View>
          <Text variant="title" className="mt-[6px]">
            Göz molası
          </Text>
          <Text variant="numHero" className="text-[44px] leading-[55px]">
            {eyeLine.big}
          </Text>
          <Text variant="bodySm" className="font-bodyMedium">
            {eyeLine.small}
          </Text>
          <View className="mt-auto flex-row items-center gap-2 pt-4">
            <View className="h-[34px] w-[34px] items-center justify-center rounded-full bg-t900">
              <Icon name="visibility" size={18} className="text-white" />
            </View>
            <Text variant="label" className="text-[13px] leading-[17px]">
              {eyeDone} tamam{"\n"}
              {eyeSkipped} atlandı
            </Text>
          </View>
        </Pressable>

        <View className="flex-1 gap-[10px]">
          <View className="rounded-block bg-t100">
            {/* Kartın tamamı detaya götürür; + düğmesi iç içe düğme olmasın diye kardeş öğe. */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Su tüketimi"
              onPress={() => router.push("/water")}
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 28 }}
              className="active:bg-white/30"
            />
            <View pointerEvents="box-none" className="gap-[6px] p-4">
              <View pointerEvents="box-none" className="flex-row items-center justify-between">
                <View pointerEvents="none" className="rounded-[12px] bg-white/55 px-[11px] py-[5px]">
                  <Text variant="caption">Su</Text>
                </View>
                <IconButton
                  icon="add"
                  iconSize={20}
                  size={34}
                  variant="dark"
                  label={goal ? `${QUICK_ADD.label} su ekle` : "Su hedefi belirle"}
                  onPress={() => (goal ? logIntake.mutate({ amountMl: QUICK_ADD.ml }) : router.push("/water"))}
                />
              </View>
              <View pointerEvents="none" className="gap-[6px]">
                <Text variant="displayLg" className="mt-[6px] text-[28px] leading-[35px]">
                  {fmt(waterMl)} ml
                </Text>
                <Text variant="bodySm" className="font-bodyMedium">
                  {goal ? `/ ${fmt(waterTarget)} ml` : "hedef belirle"}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Nefes egzersizi"
            onPress={() => router.push("/stress")}
            className="flex-1 gap-[6px] rounded-block bg-t400 p-4"
          >
            <View className="self-start rounded-[12px] bg-white/55 px-[11px] py-[5px]">
              <Text variant="caption">Stres</Text>
            </View>
            <Text variant="displayLg" className="mt-[6px] text-[26px] leading-[33px]">
              Nefes
            </Text>
            <Text variant="bodySm" className="font-bodyMedium">
              5 dk egzersiz
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Beslenme — koyu blok */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Beslenme özeti"
        onPress={() => router.push("/nutrition")}
        className="flex-row items-center gap-[14px] rounded-block bg-t900 p-[18px]"
      >
        <View className="flex-1 gap-[6px]">
          <Text variant="label" className="text-mut-l">
            Beslenme
          </Text>
          {nutrition ? (
            <Text variant="displayLg" className="text-[28px] leading-[35px] text-white">
              {fmt(kcal)}{" "}
              <Text variant="bodySm" className="text-[15px] text-mut-l">
                / {fmt(kcalTarget)} kcal
              </Text>
            </Text>
          ) : (
            <Text variant="subhead" className="text-white">
              Hedeflerini kurmak için ankete başla
            </Text>
          )}
        </View>
        <View className="flex-row gap-[6px]">
          {macroPct.map((m) => (
            <View key={m.l} className={cn("h-[58px] w-[44px] items-center justify-center rounded-[16px]", m.bg)}>
              <Text variant="subhead" className="font-black text-t900">
                {m.v}
              </Text>
              <Text variant="caption" className="text-[11px] text-t900">
                {m.l}
              </Text>
            </View>
          ))}
        </View>
      </Pressable>

      {/* Postür satırı */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Duruş molası"
        onPress={() => router.push("/posture")}
        className="flex-row items-center gap-[14px] rounded-block border-[1.5px] border-line bg-white px-4 py-[14px]"
      >
        <View className="h-[44px] w-[44px] items-center justify-center rounded-full bg-t50">
          <Icon name="accessibility_new" size={24} className="text-t700" />
        </View>
        <View className="flex-1">
          <Text variant="subhead" className="text-[16px]">
            Postür molası
          </Text>
          <Text variant="caption" muted>
            {hasPosture
              ? `Sıradaki set ${postureSession?.minutesPerHourAvailable ?? 5} dakika`
              : "Çalışma şeklini anlatarak başla"}
          </Text>
        </View>
        <Icon name="chevron_right" size={24} />
      </Pressable>

      {/* Tasarımın dışındaki mevcut özellikler — aynı blok diliyle */}
      <DailyChecklist />

      <InfoTip text={tipOfTheDay(ALL_TIPS)} />

      <View className="gap-3">
        <Text variant="section">Keşfet</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -18 }}
          contentContainerStyle={{ paddingHorizontal: 18, gap: 10 }}
        >
          {DISCOVER_ITEMS.map((item, i) => (
            <DiscoverCard key={item.id} item={item} tone={DISCOVER_TONES[i % DISCOVER_TONES.length]} />
          ))}
        </ScrollView>
      </View>

      <Text variant="bodySm" muted className="px-1">
        Bu uygulama bir sağlık hizmeti sağlamaz, yalnızca bir hatırlatma aracıdır.
      </Text>
    </TabScroll>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-[7px]">
      <View className={cn("h-[10px] w-[10px] rounded-full", color)} />
      <Text variant="label" className="text-[13px] font-heavy">
        {label}
      </Text>
    </View>
  );
}

const DISCOVER_TONES = ["bg-t200", "bg-t100", "bg-t400", "bg-t50"] as const;

function DiscoverCard({ item, tone }: { item: DiscoverItem; tone: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.kicker}: ${item.title}`}
      onPress={() => router.push(item.href)}
      style={{ width: 248, minHeight: 152 }}
      className={cn("gap-2 rounded-block p-[18px]", tone)}
    >
      <View className="self-start rounded-[12px] bg-white/55 px-[11px] py-[5px]">
        <Text variant="caption">{item.kicker}</Text>
      </View>
      <Text variant="title" className="mt-1">
        {item.title}
      </Text>
      <Text variant="bodySm" className="font-bodyMedium" numberOfLines={3}>
        {item.body}
      </Text>
    </Pressable>
  );
}
