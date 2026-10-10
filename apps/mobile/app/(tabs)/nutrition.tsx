import { canonicalMealLabel, defaultMealLabels, suggestMealLabel } from "@respira/shared-types";
import { router } from "expo-router";
import { Flame, Lightbulb, ListChecks, PieChart, UtensilsCrossed } from "lucide-react-native";
import { ActivityIndicator, Pressable, View } from "react-native";

import { FeatureIntro } from "@/components/FeatureIntro";
import { Rings } from "@/components/Rings";
import { TabScroll } from "@/components/TabScroll";
import { Icon, IconButton, Screen, Text } from "@/components/ui";
import {
  useDayMeals,
  useMealSuggestion,
  useNutritionProfile,
  useToggleMealFavorite,
  type MealRow,
} from "@/lib/nutrition-queries";
import { cn } from "@/theme/cn";
import { rgb, usePalette } from "@/theme/use-palette";

const todayKey = () => new Date().toISOString().slice(0, 10);
const fmt = (n: number) => Math.round(n).toLocaleString("tr-TR");
const MEAL_TONES = ["bg-t200", "bg-t100", "bg-t300", "bg-t400"] as const;

/**
 * Beslenme (Lavanta Blok "günlük özet"): üç halkalı makro özeti, enerji satırları,
 * öneri bloğu ve öğün blokları. Öğün favorileri, raporlar ve kan tahlili
 * hatırlatması da aynı blok diliyle altta.
 */
export default function NutritionScreen() {
  const palette = usePalette();

  const date = todayKey();
  const { data: profileData, isPending: profilePending } = useNutritionProfile();
  const { data: day, isPending: dayPending } = useDayMeals(date);
  const profile = profileData?.profile ?? null;

  // Yalnızca önseçim: öğün ekranında kullanıcı istediği öğünü seçebilir (UX-007).
  const label = suggestMealLabel(
    profile?.mealsPerDay ?? 3,
    (day?.meals ?? []).map((m) => m.mealLabel)
  );
  const { data: advice } = useMealSuggestion(date, label, !!profile);

  if (profilePending) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator />
      </Screen>
    );
  }

  // docs/04: anket tamamlanmadan takip başlamaz.
  if (!profile) {
    return (
      <FeatureIntro
        icon={UtensilsCrossed}
        title="Beslenme hedeflerini kuralım"
        subtitle="Kalori ve makro hedeflerini hesaplamak için kısa bir anket dolduralım."
        benefits={[
          { icon: Flame, title: "Günlük kalori hedefi", body: "Boy, kilo ve aktivite seviyene göre hesaplanır." },
          { icon: PieChart, title: "Makro takibi", body: "Protein, karbonhidrat ve yağ dengeni günlük gör." },
          { icon: Lightbulb, title: "Öğün önerileri", body: "Geçmiş günlerine göre kişiselleştirilmiş tavsiyeler." },
        ]}
        ctaLabel="Ankete başla"
        ctaIcon={ListChecks}
        onPress={() => router.push("/nutrition-survey")}
        caption="4 adım sürüyor, istediğin zaman değiştirebilirsin."
      />
    );
  }

  const s = day?.summary;
  const kcal = s?.totalCalories ?? 0;
  const macros = [
    { l: "Karb.", v: s?.totalCarbsG ?? 0, g: profile.targetCarbsG, color: rgb(palette.t500), dot: "bg-t500", r: 76 },
    { l: "Protein", v: s?.totalProteinG ?? 0, g: profile.targetProteinG, color: rgb(palette.t300), dot: "bg-t300", r: 59 },
    { l: "Yağ", v: s?.totalFatG ?? 0, g: profile.targetFatG, color: rgb(palette.t200), dot: "bg-t200", r: 42 },
  ];

  // Öğün blokları: profildeki öğün düzeni + (varsa) kullanıcının kendi adlarıyla girdiği öğünler.
  const meals = day?.meals ?? [];
  const slots = defaultMealLabels(profile.mealsPerDay);
  const knownCanon = new Set(slots.map(canonicalMealLabel));
  const extraLabels = [...new Set(meals.map((m) => m.mealLabel).filter((l) => !knownCanon.has(canonicalMealLabel(l))))];
  const blocks = [...slots, ...extraLabels].map((slotLabel) => ({
    label: slotLabel,
    meals: meals.filter((m) => canonicalMealLabel(m.mealLabel) === canonicalMealLabel(slotLabel)),
  }));

  return (
    <TabScroll>
      <View className="flex-row items-center justify-between">
        <View className="h-[46px] w-[46px]" />
        <Text variant="title" className="text-[20px] font-black">
          Beslenme
        </Text>
        <IconButton icon="calendar_month" iconSize={22} label="Raporlar" onPress={() => router.push("/nutrition-report")} />
      </View>

      {/* Halkalar + makrolar + enerji */}
      <View className="items-center gap-[18px] rounded-blockLg bg-white px-5 py-[22px]">
        <Rings
          size={170}
          strokeWidth={13}
          trackColor={rgb(palette.t50)}
          rings={macros.map((m) => ({ r: m.r, value: m.g > 0 ? m.v / m.g : 0, color: m.color }))}
        />
        <View className="w-full flex-row">
          {macros.map((m) => (
            <View key={m.l} className="flex-1 items-center gap-0.5">
              <Text variant="label" muted className="text-[13px]">
                {m.l}
              </Text>
              <View className="flex-row items-center gap-[5px]">
                <View className={cn("h-[9px] w-[9px] rounded-full", m.dot)} />
                <Text variant="displayLg" className="text-[22px] leading-[26px]">
                  {fmt(m.v)}
                </Text>
              </View>
              <Text variant="caption">/{fmt(m.g)} g</Text>
            </View>
          ))}
        </View>
        <View className="w-full gap-2">
          <EnergyLine label="Alınan enerji" value={`${fmt(kcal)} kcal`} />
          <EnergyLine label="Kalan" value={`${fmt(Math.max(0, profile.targetCalories - kcal))} kcal`} />
          <EnergyLine label="Hedef · Mifflin-St Jeor" value={`${fmt(profile.targetCalories)} kcal`} />
        </View>
        {meals.some((m) => m.mode === "SIMPLE") ? (
          <Text variant="caption" muted className="w-full">
            Basit modda girilen öğünler bu toplamlara dahil değildir.
          </Text>
        ) : null}
      </View>

      {/* Öneri */}
      {advice ? (
        <View className="flex-row items-start gap-3 rounded-card bg-t300 px-[18px] py-4">
          <Icon name="auto_awesome" size={22} className="text-t900" />
          <View className="flex-1 gap-1.5">
            <Text variant="label">
              {label} önerisi · {advice.suggestion.basis === "numeric" ? "sayısal" : "genel"}
            </Text>
            {advice.previousDayReference ? (
              <Text variant="bodySm" className="font-bodySemiBold text-t900">
                {advice.previousDayReference}
              </Text>
            ) : null}
            <Text variant="bodySm" className="font-bodySemiBold leading-[20px] text-t900">
              {advice.suggestion.message}
            </Text>
            {/* docs/04: öneri HER ZAMAN bu uyarıyla birlikte gösterilir. */}
            <Text variant="caption" className="font-bodyMedium text-t800">
              {advice.suggestion.disclaimer}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Öğün blokları */}
      {dayPending ? (
        <ActivityIndicator />
      ) : (
        <View className="flex-row flex-wrap gap-[10px]">
          {blocks.map((b, i) => (
            <MealBlock key={b.label} label={b.label} meals={b.meals} tone={MEAL_TONES[i % MEAL_TONES.length]} date={date} />
          ))}
        </View>
      )}

      {/* Favoriler / öğün ayrıntısı */}
      {meals.length > 0 ? (
        <View className="gap-2 rounded-card bg-white p-4">
          <Text variant="title">Bugünün öğünleri</Text>
          {meals.map((m, i) => (
            <MealItem key={m.id} meal={m} last={i === meals.length - 1} />
          ))}
        </View>
      ) : null}

      {/* Kan tahlili */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kan tahlili hatırlatması"
        onPress={() => router.push("/blood-test-reminder")}
        className="flex-row items-center gap-[14px] rounded-card bg-t900 px-[18px] py-4"
      >
        <View className="h-[44px] w-[44px] items-center justify-center rounded-full bg-t400">
          <Icon name="bloodtype" size={24} className="text-t900" />
        </View>
        <View className="flex-1 gap-0.5">
          <Text variant="subhead" className="text-white">
            Kan tahlili hatırlatması
          </Text>
          <Text variant="caption" className="font-bodyMedium text-mut-l">
            HbA1c, açlık şekeri
          </Text>
        </View>
        <View className="rounded-[14px] bg-white px-3 py-2">
          <Text variant="caption" className="font-heavy text-t900">
            Planla
          </Text>
        </View>
      </Pressable>

      <Text variant="bodySm" muted className="px-1">
        Bu uygulama bir sağlık hizmeti sağlamaz.
      </Text>
    </TabScroll>
  );
}

function EnergyLine({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-baseline gap-2">
      <Text variant="bodySm" className="font-bodyMedium">
        {label}
      </Text>
      <View className="flex-1 border-b-[1.5px] border-dotted border-line-2" />
      <Text variant="bodySm" className="font-black">
        {value}
      </Text>
    </View>
  );
}

/** Öğün bloğu: doluysa renkli (kcal + içerik), boşsa beyaz + ekle düğmesi. */
function MealBlock({ label, meals, tone, date }: { label: string; meals: MealRow[]; tone: string; date: string }) {
  const kcal = meals.reduce((a, m) => a + (m.calories ?? 0), 0);
  const filled = meals.length > 0;
  const summary = meals
    .map((m) => (m.mode === "DETAILED" ? `${m.calories ?? 0} kcal` : (m.rawText ?? "")))
    .filter(Boolean)
    .join(", ");
  const add = () => router.push({ pathname: "/meal-entry", params: { date, label } });

  if (!filled) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label} ekle`}
        onPress={add}
        className="min-h-[104px] w-[48.4%] flex-row items-center justify-between rounded-tile bg-white p-[14px]"
      >
        <Text variant="subhead">{label}</Text>
        <View className="h-[34px] w-[34px] items-center justify-center rounded-full bg-t900">
          <Icon name="add" size={20} className="text-white" />
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${kcal} kcal. Öğün ekle`}
      onPress={add}
      className={cn("min-h-[104px] w-[48.4%] gap-[6px] rounded-tile p-[14px]", tone)}
    >
      <Text variant="label">{label}</Text>
      <Text variant="displayLg" className="text-[24px] leading-[24px]">
        {fmt(kcal)}
      </Text>
      <Text variant="caption" className="font-bodyMedium" numberOfLines={2}>
        {summary || "—"}
      </Text>
    </Pressable>
  );
}

function MealItem({ meal, last }: { meal: MealRow; last: boolean }) {
  const toggle = useToggleMealFavorite();

  return (
    <View className={cn("flex-row items-center gap-3 py-2", !last && "border-b-[1.5px] border-line")}>
      <View className="flex-1 gap-1">
        <View className="flex-row items-baseline gap-2">
          <Text variant="label">{meal.mealLabel}</Text>
          <Text variant="caption" muted>
            {meal.mode === "DETAILED" ? "detaylı" : "basit"}
          </Text>
        </View>
        {meal.mode === "DETAILED" ? (
          <Text variant="data" muted>
            {meal.calories ?? 0} kcal · P {Math.round(meal.proteinG ?? 0)} · K {Math.round(meal.carbsG ?? 0)} · Y{" "}
            {Math.round(meal.fatG ?? 0)} g
          </Text>
        ) : (
          <Text variant="bodySm" muted numberOfLines={2}>
            {meal.rawText ?? "(içerik temizlendi)"}
          </Text>
        )}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={meal.isFavorite ? "Favoriden çıkar" : "Favoriye ekle"}
        accessibilityState={{ selected: meal.isFavorite }}
        onPress={() => toggle.mutate({ id: meal.id, isFavorite: !meal.isFavorite })}
        hitSlop={10}
        style={{ minWidth: 48, minHeight: 48 }}
        className="items-center justify-center"
      >
        {({ pressed }) => (
          <Icon
            name="star"
            size={26}
            className={meal.isFavorite ? "text-t500" : "text-line-2"}
            style={{ opacity: pressed ? 0.65 : 1 }}
          />
        )}
      </Pressable>
    </View>
  );
}
