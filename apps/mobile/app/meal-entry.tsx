import { mealEntrySchema, type MealEntryInput } from "@respira/shared-types";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { ChoiceGroup } from "@/components/nutrition/ChoiceGroup";
import { Field } from "@/components/nutrition/Field";
import { Button, Card, Screen, Text } from "@/components/ui";
import { useAddMeal } from "@/lib/nutrition-queries";

type Mode = "SIMPLE" | "DETAILED";

const num = (s: string) => (s.trim() === "" ? null : Number(s));

/**
 * docs/04 — iki modlu öğün girişi.
 *
 * Kabul kriteri: "kullanıcıya hangi modda takip yapılıp yapılmadığı açıkça
 * gösteriliyor". Bu yüzden mod seçiminin hemen altında ne olacağını anlatan
 * bir satır var ve basit modda sayısal alanlar hiç gösterilmiyor.
 */
export default function MealEntryScreen() {
  const params = useLocalSearchParams<{ date?: string; label?: string }>();
  const date = params.date ?? new Date().toISOString().slice(0, 10);

  const add = useAddMeal();
  const [mode, setMode] = useState<Mode>("SIMPLE");
  const [label, setLabel] = useState(params.label ?? "Öğün");
  const [rawText, setRawText] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState<"g" | "adet" | "ml">("g");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [fiber, setFiber] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);

    const payload: MealEntryInput =
      mode === "SIMPLE"
        ? { date, mealLabel: label, mode, rawText: rawText.trim(), isFavorite: false }
        : {
            date,
            mealLabel: label,
            mode,
            rawText: null,
            foodItemsDetail: [
              {
                name: name.trim(),
                amount: Number(amount),
                unit,
                calories: num(calories),
                protein: num(protein),
                carbs: num(carbs),
                fat: num(fat),
                fiber: num(fiber),
              },
            ],
            calories: num(calories) === null ? null : Math.round(Number(calories)),
            proteinG: num(protein),
            carbsG: num(carbs),
            fatG: num(fat),
            fiberG: num(fiber),
            isFavorite: false,
          };

    const parsed = mealEntrySchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Girdiğin bilgilerde bir sorun var.");
      return;
    }

    try {
      await add.mutateAsync(parsed.data);
      router.back();
    } catch {
      setError("Kaydedilemedi. Bağlantını kontrol edip tekrar dene.");
    }
  }

  return (
    <Screen edges={["bottom"]}>
      <ScrollView contentContainerClassName="gap-4 p-4 pb-8">
        <Card className="gap-4">
          <Field label="Öğün adı" value={label} onChangeText={setLabel} maxLength={40} />

          <ChoiceGroup<Mode>
            label="Giriş modu"
            choices={[
              { value: "SIMPLE", label: "Basit" },
              { value: "DETAILED", label: "Detaylı" },
            ]}
            value={mode}
            onChange={setMode}
          />

          <Text variant="bodySm" muted>
            {mode === "SIMPLE"
              ? "Sadece ne yediğini yaz. Besin değeri hesaplanmaz ve günlük toplamlara eklenmez — yalnızca günlük not olarak kalır."
              : "Gramaj veya adet gir. Besin değerleri günlük toplamlarına ve raporlarına işlenir."}
          </Text>
        </Card>

        {mode === "SIMPLE" ? (
          <Card>
            <Field
              label="Ne yedin?"
              value={rawText}
              onChangeText={setRawText}
              placeholder="Yumurta, peynir, zeytin"
              multiline
              maxLength={2000}
              className="min-h-24 py-3"
            />
          </Card>
        ) : (
          <Card className="gap-4">
            <Field label="Besin" value={name} onChangeText={setName} placeholder="Tavuk göğsü" maxLength={80} />
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Field label="Miktar" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" maxLength={6} />
              </View>
              <View className="flex-1">
                <ChoiceGroup<"g" | "adet" | "ml">
                  label="Birim"
                  choices={[
                    { value: "g", label: "g" },
                    { value: "adet", label: "adet" },
                    { value: "ml", label: "ml" },
                  ]}
                  value={unit}
                  onChange={setUnit}
                />
              </View>
            </View>
            <Field label="Kalori (kcal)" value={calories} onChangeText={setCalories} keyboardType="number-pad" maxLength={6} />
            <View className="flex-row gap-2">
              <View className="flex-1"><Field label="Protein (g)" value={protein} onChangeText={setProtein} keyboardType="decimal-pad" maxLength={6} /></View>
              <View className="flex-1"><Field label="Karb (g)" value={carbs} onChangeText={setCarbs} keyboardType="decimal-pad" maxLength={6} /></View>
            </View>
            <View className="flex-row gap-2">
              <View className="flex-1"><Field label="Yağ (g)" value={fat} onChangeText={setFat} keyboardType="decimal-pad" maxLength={6} /></View>
              <View className="flex-1"><Field label="Lif (g)" optional value={fiber} onChangeText={setFiber} keyboardType="decimal-pad" maxLength={6} /></View>
            </View>
          </Card>
        )}

        {error ? (
          <Text variant="bodySm" className="text-danger">
            {error}
          </Text>
        ) : null}

        <Button title="Kaydet" onPress={submit} loading={add.isPending} />
      </ScrollView>
    </Screen>
  );
}
