import {
  FOOD_TABLE_DISCLAIMER,
  availableUnits,
  defaultMealLabels,
  foodItemSchema,
  gramsFor,
  mealEntrySchema,
  scaleNutrients,
  sumFoodItems,
  type FoodEntry,
  type FoodItemInput,
  type FoodUnit,
  type MealEntryInput,
} from "@respira/shared-types";
import { router, useLocalSearchParams } from "expo-router";
import { Plus } from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { ChoiceGroup } from "@/components/nutrition/ChoiceGroup";
import { Field } from "@/components/nutrition/Field";
import { FieldLabel } from "@/components/nutrition/FieldLabel";
import { FoodSearchField } from "@/components/nutrition/FoodSearchField";
import { MacroSummary } from "@/components/nutrition/MacroSummary";
import { Button, Card, Screen, Segmented, Text } from "@/components/ui";
import { useAddMeal, useNutritionProfile } from "@/lib/nutrition-queries";
import { pressedOpacity, touchTarget } from "@/theme/tokens";
import { rgb, usePalette } from "@/theme/use-palette";

type Mode = "SIMPLE" | "DETAILED";
type MacroKey = "calories" | "protein" | "carbs" | "fat" | "fiber";

/** Seçim listesinde "kendi adımı yazacağım" seçeneğinin değeri; öğün adı olarak kaydedilmez. */
const CUSTOM_LABEL = "__custom__";

const num = (s: string) => (s.trim() === "" ? null : Number(s));

/** Tablodan besin seçilmediğinde hangi birimin doğru olduğunu bilemeyiz; hepsi açık. */
const ALL_UNITS: FoodUnit[] = ["g", "adet", "ml"];
const UNIT_LABEL: Record<FoodUnit, string> = { g: "g", adet: "adet", ml: "ml" };

/**
 * Listeye eklenmiş bir kalem. `draft` düzenlemeye dönüldüğünde formu olduğu gibi
 * geri kurmak için tutuluyor (seçili besin, elle değiştirilmiş değerler dahil).
 */
interface ListedItem {
  key: number;
  item: FoodItemInput;
  draft: {
    food: FoodEntry | null;
    name: string;
    amount: string;
    unit: FoodUnit;
    edited: Partial<Record<MacroKey, string>>;
    manualEntry: boolean;
    editingMacros: boolean;
  };
}

/**
 * docs/04 — iki modlu öğün girişi.
 *
 * Kabul kriteri: "kullanıcıya hangi modda takip yapılıp yapılmadığı açıkça
 * gösteriliyor". Bu yüzden mod seçiminin hemen altında ne olacağını anlatan
 * bir satır var ve basit modda sayısal alanlar hiç gösterilmiyor.
 *
 * Detaylı modda besin tablodan seçilirse makrolar miktardan hesaplanıyor
 * (IDEA-008) ve okunacak bir özet olarak gösteriliyor. Sayısal alanlar ancak
 * kullanıcı düzenlemek istediğinde ya da besin tabloda yoksa açılıyor
 * (UI-008) — boş beş input karşılama ekranı olmasın.
 *
 * Detaylı modda bir öğün birden çok besinden oluşabilir (UX-006): form her
 * seferinde tek besin alır, "Listeye ekle" ile kalem listeye geçer ve form
 * boşalır. Tek "Kaydet" tüm kalemleri TEK öğün kaydı olarak gönderir; toplam
 * makrolar burada kalemlerden hesaplanır.
 */
export default function MealEntryScreen() {
  const params = useLocalSearchParams<{ date?: string; label?: string }>();
  const date = params.date ?? new Date().toISOString().slice(0, 10);

  const add = useAddMeal();
  const [mode, setMode] = useState<Mode>("SIMPLE");
  const { data: profileData } = useNutritionProfile();
  const mealLabels = useMemo(
    () => defaultMealLabels(profileData?.profile?.mealsPerDay ?? 3),
    [profileData]
  );
  const [label, setLabel] = useState(params.label ?? mealLabels[0]);
  /** Kullanıcı "Diğer"e bastı ya da gelen ad varsayılan listede yok. */
  const [customLabel, setCustomLabel] = useState(false);
  const isCustomLabel = customLabel || !mealLabels.includes(label);
  const [rawText, setRawText] = useState("");
  const [name, setName] = useState("");
  const [food, setFood] = useState<FoodEntry | null>(null);
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState<FoodUnit>("g");
  const [edited, setEdited] = useState<Partial<Record<MacroKey, string>>>({});
  /** Besin tabloda yok — kullanıcı değerleri kendi giriyor. */
  const [manualEntry, setManualEntry] = useState(false);
  /** Hesaplanan değerleri düzenlemek için alanlar açıldı. */
  const [editingMacros, setEditingMacros] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ListedItem[]>([]);
  const nextKey = useRef(0);
  const palette = usePalette();

  /** Yalnızca bu besin için çevrilebilen birimler (UI-008). */
  const units = useMemo(() => (food ? availableUnits(food) : ALL_UNITS), [food]);

  /** Tablodan hesaplanan değerler; besin seçilmemişse veya miktar boşsa null. */
  const computed = useMemo(
    () => (food ? scaleNutrients(food, Number(amount), unit) : null),
    [food, amount, unit]
  );

  const grams = food ? gramsFor(food, Number(amount), unit) : null;

  const totals = useMemo(() => sumFoodItems(items.map((i) => i.item)), [items]);

  const showFields = manualEntry || editingMacros;
  const showSummary = !showFields && computed !== null;
  const detailStarted = food !== null || manualEntry;

  /** Gösterilen değer: kullanıcı o alana dokunduysa onun girdisi, yoksa hesap. */
  function macroText(key: MacroKey): string {
    const own = edited[key];
    if (own !== undefined) return own;
    if (!computed) return "";
    const v = computed[key];
    return v === null ? "" : String(v);
  }

  function selectFood(entry: FoodEntry) {
    setFood(entry);
    setName(entry.name);
    setEdited({});
    setManualEntry(false);
    setEditingMacros(false);
    // Seçili birim bu besinde çevrilemiyorsa grama dön.
    if (!availableUnits(entry).includes(unit)) setUnit("g");
  }

  function clearFood() {
    setFood(null);
    setEdited({});
    setEditingMacros(false);
  }

  function restoreComputed() {
    setEdited({});
    setEditingMacros(false);
  }

  /** Formdaki besin kalem olarak geçerliyse kalemi, değilse Türkçe hata metnini döndürür. */
  function draftItem(): { item: FoodItemInput } | { error: string } {
    if (name.trim() === "") return { error: "Besin adını gir." };
    if (!(Number(amount) > 0)) return { error: "Miktarı gir." };
    const parsed = foodItemSchema.safeParse({
      name: name.trim(),
      amount: Number(amount),
      unit,
      calories: num(macroText("calories")),
      protein: num(macroText("protein")),
      carbs: num(macroText("carbs")),
      fat: num(macroText("fat")),
      fiber: num(macroText("fiber")),
    });
    return parsed.success
      ? { item: parsed.data }
      : { error: parsed.error.issues[0]?.message ?? "Girdiğin bilgilerde bir sorun var." };
  }

  /** Form kullanıcının elinde bir şey var mı — boş bir formun kaydı engellemesini önler. */
  const draftTouched = detailStarted || name.trim() !== "" || amount.trim() !== "";

  function resetDraft() {
    setName("");
    setFood(null);
    setAmount("");
    setUnit("g");
    setEdited({});
    setManualEntry(false);
    setEditingMacros(false);
  }

  function addItem() {
    setError(null);
    const built = draftItem();
    if ("error" in built) {
      setError(built.error);
      return;
    }
    const key = nextKey.current++;
    setItems((prev) => [
      ...prev,
      {
        key,
        item: built.item,
        draft: { food, name, amount, unit, edited, manualEntry, editingMacros },
      },
    ]);
    resetDraft();
  }

  function removeItem(key: number) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  /** Kalemi listeden alıp forma geri yükler; formda yarım kalan varsa önce listeye ekler. */
  function editItem(entry: ListedItem) {
    setError(null);
    if (draftTouched) {
      const built = draftItem();
      if ("error" in built) {
        setError(`Önce formdaki besini tamamla: ${built.error}`);
        return;
      }
      const key = nextKey.current++;
      setItems((prev) => [
        ...prev.filter((i) => i.key !== entry.key),
        { key, item: built.item, draft: { food, name, amount, unit, edited, manualEntry, editingMacros } },
      ]);
    } else {
      removeItem(entry.key);
    }
    const d = entry.draft;
    setFood(d.food);
    setName(d.name);
    setAmount(d.amount);
    setUnit(d.unit);
    setEdited(d.edited);
    setManualEntry(d.manualEntry);
    setEditingMacros(d.editingMacros);
  }

  async function submit() {
    setError(null);

    if (label.trim() === "") {
      setError("Öğün adını gir.");
      return;
    }

    let detailItems: FoodItemInput[] = [];
    if (mode === "DETAILED") {
      detailItems = items.map((i) => i.item);
      // Listede kalem varken boş/yarım bırakılan form kaydı engellemez; doluysa o da öğüne girer.
      if (draftTouched && (items.length === 0 || amount.trim() !== "" || food !== null)) {
        const built = draftItem();
        if ("error" in built) {
          setError(built.error);
          return;
        }
        detailItems.push(built.item);
      }
    }
    const totals = sumFoodItems(detailItems);

    const payload: MealEntryInput =
      mode === "SIMPLE"
        ? { date, mealLabel: label.trim(), mode, rawText: rawText.trim(), isFavorite: false }
        : {
            date,
            mealLabel: label.trim(),
            mode,
            rawText: null,
            foodItemsDetail: detailItems,
            calories: totals.calories,
            proteinG: totals.proteinG,
            carbsG: totals.carbsG,
            fatG: totals.fatG,
            fiberG: totals.fiberG,
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
      <ScrollView contentContainerClassName="gap-4 p-5 pb-8" keyboardShouldPersistTaps="handled">
        <Card className="gap-4">
          <ChoiceGroup<string>
            label="Öğün"
            choices={[
              ...mealLabels.map((l) => ({ value: l, label: l })),
              { value: CUSTOM_LABEL, label: "Diğer" },
            ]}
            value={isCustomLabel ? CUSTOM_LABEL : label}
            onChange={(v) => {
              if (v === CUSTOM_LABEL) {
                // Varsayılan adı silip boş alan aç; yoksa "Diğer" seçili ama ad hâlâ "Sabah" kalırdı.
                setCustomLabel(true);
                if (mealLabels.includes(label)) setLabel("");
              } else {
                setCustomLabel(false);
                setLabel(v);
              }
            }}
          />

          {isCustomLabel ? (
            <Field
              label="Öğün adı"
              value={label}
              onChangeText={setLabel}
              placeholder="Örn. Antrenman sonrası"
              maxLength={40}
            />
          ) : null}

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
              : "Besini tablodan seç, miktarı gir; besin değerleri otomatik hesaplanıp günlük toplamlarına işlenir. Birden fazla besin için her birini “Listeye ekle” ile ekle; hepsi tek öğün olarak kaydedilir."}
          </Text>
        </Card>

        {mode === "SIMPLE" ? (
          <Card>
            <Field
              label="Ne yedin?"
              value={rawText}
              onChangeText={setRawText}
              placeholder="Yumurta, peynir, zeytin"
              hint="Birden fazla şey yediysen virgülle ayırarak hepsini yazabilirsin."
              multiline
              maxLength={2000}
              className="min-h-24 py-3"
            />
          </Card>
        ) : (
          <Card className="gap-5">
            {items.length > 0 ? (
              <View className="gap-3">
                {items.map((entry) => (
                  <View
                    key={entry.key}
                    className="flex-row items-center gap-3 rounded-lg border border-border bg-surface p-3"
                  >
                    <View className="flex-1 gap-0.5">
                      <Text variant="label" numberOfLines={1}>
                        {entry.item.name}
                      </Text>
                      <Text variant="label" muted>
                        {`${entry.item.amount} ${entry.item.unit}${
                          entry.item.calories != null ? ` · ${Math.round(entry.item.calories)} kcal` : ""
                        }`}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => editItem(entry)}
                      accessibilityRole="button"
                      accessibilityLabel={`${entry.item.name} düzenle`}
                      hitSlop={touchTarget.slop}
                      style={({ pressed }) => ({ opacity: pressed ? pressedOpacity : 1 })}
                    >
                      <Text variant="bodySm" className="text-accent">
                        Düzenle
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => removeItem(entry.key)}
                      accessibilityRole="button"
                      accessibilityLabel={`${entry.item.name} kaldır`}
                      hitSlop={touchTarget.slop}
                      style={({ pressed }) => ({ opacity: pressed ? pressedOpacity : 1 })}
                    >
                      <Text variant="bodySm" className="text-danger">
                        Kaldır
                      </Text>
                    </Pressable>
                  </View>
                ))}

                {items.length > 1 && totals.calories !== null ? (
                  <Text variant="label" muted>
                    {`Toplam: ${totals.calories} kcal${
                      totals.proteinG !== null ? ` · ${totals.proteinG} g protein` : ""
                    }`}
                  </Text>
                ) : null}

                <Text variant="subhead">Yeni besin</Text>
              </View>
            ) : null}

            <FoodSearchField
              value={name}
              onChangeText={setName}
              selected={food}
              onSelect={selectFood}
              onClear={clearFood}
            />

            {!detailStarted ? (
              <Pressable
                onPress={() => setManualEntry(true)}
                accessibilityRole="button"
                style={({ pressed }) => ({ opacity: pressed ? pressedOpacity : 1 })}
              >
                <Text variant="bodySm" className="text-accent">
                  Aradığın besin tabloda yok mu? Değerleri elle gir
                </Text>
              </Pressable>
            ) : null}

            {detailStarted ? (
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Field
                    label="Miktar"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    maxLength={6}
                    placeholder="150"
                  />
                </View>
                <View className="flex-1 gap-2">
                  <FieldLabel label="Birim" />
                  {units.length > 1 ? (
                    <Segmented<FoodUnit>
                      options={units.map((u) => ({ value: u, label: UNIT_LABEL[u] }))}
                      value={unit}
                      onChange={setUnit}
                    />
                  ) : (
                    // Tek seçenekli bir seçici anlamsız; birimi sabit gösteriyoruz.
                    <View
                      className="items-center justify-center rounded-full border border-border bg-surface"
                      style={{ minHeight: touchTarget.min }}
                    >
                      <Text variant="label" muted>
                        {UNIT_LABEL[units[0]]}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ) : null}

            {showSummary && computed !== null ? (
              <View className="gap-3">
                <MacroSummary
                  values={computed}
                  basis={
                    unit === "g"
                      ? `${grams} g için hesaplandı`
                      : `${amount} ${UNIT_LABEL[unit]} ≈ ${Math.round(grams ?? 0)} g için hesaplandı`
                  }
                />
                <Pressable
                  onPress={() => setEditingMacros(true)}
                  accessibilityRole="button"
                  style={({ pressed }) => ({ opacity: pressed ? pressedOpacity : 1 })}
                >
                  <Text variant="bodySm" className="text-accent">
                    Değerleri düzenle
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {showFields ? (
              <View className="gap-4">
                <Field
                  label="Kalori (kcal)"
                  value={macroText("calories")}
                  onChangeText={(t) => setEdited((p) => ({ ...p, calories: t }))}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Field
                      label="Protein (g)"
                      value={macroText("protein")}
                      onChangeText={(t) => setEdited((p) => ({ ...p, protein: t }))}
                      keyboardType="decimal-pad"
                      maxLength={6}
                    />
                  </View>
                  <View className="flex-1">
                    <Field
                      label="Karb (g)"
                      value={macroText("carbs")}
                      onChangeText={(t) => setEdited((p) => ({ ...p, carbs: t }))}
                      keyboardType="decimal-pad"
                      maxLength={6}
                    />
                  </View>
                </View>
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Field
                      label="Yağ (g)"
                      value={macroText("fat")}
                      onChangeText={(t) => setEdited((p) => ({ ...p, fat: t }))}
                      keyboardType="decimal-pad"
                      maxLength={6}
                    />
                  </View>
                  <View className="flex-1">
                    <Field
                      label="Lif (g)"
                      optional
                      value={macroText("fiber")}
                      onChangeText={(t) => setEdited((p) => ({ ...p, fiber: t }))}
                      keyboardType="decimal-pad"
                      maxLength={6}
                    />
                  </View>
                </View>

                {computed !== null ? (
                  <Pressable
                    onPress={restoreComputed}
                    accessibilityRole="button"
                    style={({ pressed }) => ({ opacity: pressed ? pressedOpacity : 1 })}
                  >
                    <Text variant="bodySm" className="text-accent">
                      Hesaplanan değerlere dön
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            {food ? (
              <Text variant="label" muted>
                {FOOD_TABLE_DISCLAIMER}
              </Text>
            ) : null}

            {detailStarted ? (
              <Button
                title="Listeye ekle"
                variant="secondary"
                icon={Plus}
                iconColor={rgb(palette.accent)}
                onPress={addItem}
              />
            ) : null}
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
