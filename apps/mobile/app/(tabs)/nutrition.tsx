import { Link, router } from "expo-router";
import { Star } from "lucide-react-native";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

import { Button, Card, Screen, Text } from "@/components/ui";
import {
  useDayMeals,
  useMealSuggestion,
  useNutritionProfile,
  useToggleMealFavorite,
  type MealRow,
} from "@/lib/nutrition-queries";
import { useThemeStore } from "@/theme/theme-store";
import { darkPalette, lightPalette, touchTarget } from "@/theme/tokens";

const rgb = (c: string) => `rgb(${c.split(" ").join(", ")})`;
const todayKey = () => new Date().toISOString().slice(0, 10);

/** Bir sonraki öğünün etiketini kayıt sayısına göre tahmin eder. */
function nextMealLabel(count: number, mealsPerDay: number): string {
  const labels = ["Kahvaltı", "Öğle", "Akşam", "Ara öğün", "Ara öğün", "Ara öğün"];
  return labels[Math.min(count, Math.min(mealsPerDay, labels.length) - 1)] ?? "Sonraki öğün";
}

export default function NutritionScreen() {
  const date = todayKey();
  const { data: profileData, isPending: profilePending } = useNutritionProfile();
  const { data: day, isPending: dayPending } = useDayMeals(date);
  const profile = profileData?.profile ?? null;

  const label = nextMealLabel(day?.meals.length ?? 0, profile?.mealsPerDay ?? 3);
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
      <Screen edges={["top"]} className="justify-center p-6">
        <Card className="gap-3">
          <Text variant="title">Beslenme takibine başla</Text>
          <Text variant="bodySm" muted>
            Sana uygun kalori ve makro hedeflerini hesaplayabilmemiz için kısa
            bir anket dolduralım. 5 adım sürüyor ve istediğin zaman
            değiştirebilirsin.
          </Text>
          <Button title="Ankete başla" onPress={() => router.push("/nutrition-survey")} />
        </Card>
      </Screen>
    );
  }

  const s = day?.summary;
  const pct = (v: number | undefined, t: number) =>
    v === undefined || t === 0 ? 0 : Math.round((v / t) * 100);

  return (
    <Screen edges={["top"]}>
      <ScrollView contentContainerClassName="gap-6 p-4 pb-12">
        <View className="gap-1">
          <Text variant="label" muted>
            BUGÜN
          </Text>
          <Text variant="displayLg">Beslenme</Text>
        </View>

        <Card className="gap-3">
          <Text variant="label" muted>
            KALORİ
          </Text>
          <View className="flex-row items-baseline gap-2">
            <Text variant="displayXl">{s?.totalCalories ?? 0}</Text>
            <Text variant="title" muted>
              / {profile.targetCalories} kcal
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-x-4 gap-y-1">
            <Text variant="data" muted>
              Protein {Math.round(s?.totalProteinG ?? 0)} / {Math.round(profile.targetProteinG)} g
              (%{pct(s?.totalProteinG, profile.targetProteinG)})
            </Text>
            <Text variant="data" muted>
              Karb {Math.round(s?.totalCarbsG ?? 0)} / {Math.round(profile.targetCarbsG)} g
            </Text>
            <Text variant="data" muted>
              Yağ {Math.round(s?.totalFatG ?? 0)} / {Math.round(profile.targetFatG)} g
            </Text>
          </View>
          {day?.meals.some((m) => m.mode === "SIMPLE") ? (
            <Text variant="bodySm" muted>
              Basit modda girilen öğünler bu toplamlara dahil değildir.
            </Text>
          ) : null}
        </Card>

        {advice ? (
          <Card className="gap-2">
            <View className="flex-row items-baseline gap-2">
              <Text variant="title">{label} önerisi</Text>
              <Text variant="label" muted>
                {advice.suggestion.basis === "numeric" ? "sayısal" : "genel"}
              </Text>
            </View>
            {advice.previousDayReference ? (
              <Text variant="bodySm" className="text-warm">
                {advice.previousDayReference}
              </Text>
            ) : null}
            <Text variant="body">{advice.suggestion.message}</Text>
            {/* docs/04: öneri HER ZAMAN bu uyarıyla birlikte gösterilir. */}
            <Text variant="bodySm" muted>
              {advice.suggestion.disclaimer}
            </Text>
          </Card>
        ) : null}

        <Button
          title={`${label} ekle`}
          onPress={() => router.push({ pathname: "/meal-entry", params: { date, label } })}
        />

        <Card className="gap-3">
          <Text variant="title">Bugünün öğünleri</Text>
          {dayPending ? (
            <ActivityIndicator />
          ) : day?.meals.length === 0 ? (
            <Text variant="bodySm" muted>
              Henüz öğün eklemedin.
            </Text>
          ) : (
            day?.meals.map((m) => <MealItem key={m.id} meal={m} />)
          )}
        </Card>

        <Link href="/nutrition-report" asChild>
          <Button title="Raporlar" variant="secondary" />
        </Link>

        <Text variant="bodySm" muted>
          Bu uygulama bir sağlık hizmeti sağlamaz.
        </Text>
      </ScrollView>
    </Screen>
  );
}

function MealItem({ meal }: { meal: MealRow }) {
  const toggle = useToggleMealFavorite();
  const preference = useThemeStore((st) => st.preference);
  const palette = preference === "light" ? lightPalette : darkPalette;

  return (
    <View className="flex-row items-center gap-3 border-b border-border pb-3">
      <View className="flex-1 gap-1">
        <View className="flex-row items-baseline gap-2">
          <Text variant="label">{meal.mealLabel.toLocaleUpperCase("tr-TR")}</Text>
          <Text variant="label" muted>
            {meal.mode === "DETAILED" ? "detaylı" : "basit"}
          </Text>
        </View>
        {meal.mode === "DETAILED" ? (
          <Text variant="data" muted>
            {meal.calories ?? 0} kcal · P {Math.round(meal.proteinG ?? 0)} · K{" "}
            {Math.round(meal.carbsG ?? 0)} · Y {Math.round(meal.fatG ?? 0)} g
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
        style={{ minWidth: touchTarget.min, minHeight: touchTarget.min }}
        className="items-center justify-center"
      >
        {({ pressed }) => (
          <Star
            size={22}
            strokeWidth={1.75}
            color={rgb(meal.isFavorite ? palette.warm : palette.textMuted)}
            fill={meal.isFavorite ? rgb(palette.warm) : "transparent"}
            opacity={pressed ? 0.65 : 1}
          />
        )}
      </Pressable>
    </View>
  );
}
