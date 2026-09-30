import { normalizeFoodQuery, searchFoods, type FoodEntry } from "@respira/shared-types";
import { X } from "lucide-react-native";
import { useMemo } from "react";
import { Pressable, View } from "react-native";

import { Field } from "@/components/nutrition/Field";
import { FieldLabel } from "@/components/nutrition/FieldLabel";
import { Text } from "@/components/ui";
import { pressedOpacity, touchTarget } from "@/theme/tokens";
import { rgb, usePalette } from "@/theme/use-palette";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  /** Listeden seçilen besin; null ise kullanıcı hâlâ arıyor. */
  selected: FoodEntry | null;
  onSelect: (entry: FoodEntry) => void;
  onClear: () => void;
}

const SOURCE_LABEL: Record<FoodEntry["source"], string> = {
  turkomp: "TürKomp",
  curated: "Yemek tablosu",
};

/** Ayraçlar metin sütununda başlasın: sol iç boşluk (12) + rozet (48) + aradaki boşluk (12). */
const BADGE_COLUMN = 72;

/**
 * Kalori rozeti. Rakam mono (tokens: "grafik/tablo rakamları hizalı dursun"),
 * böylece liste boyunca sayılar aynı sütunda okunuyor.
 */
function KcalBadge({ calories }: { calories: number }) {
  return (
    <View className="w-12 items-center justify-center rounded-md bg-accent/10 py-1.5">
      <Text variant="data" className="text-accent">
        {Math.round(calories)}
      </Text>
      <Text variant="label" muted>
        kcal
      </Text>
    </View>
  );
}

function FoodMeta({ entry }: { entry: FoodEntry }) {
  return (
    <Text variant="label" muted numberOfLines={1}>
      {`100 g · ${SOURCE_LABEL[entry.source]}`}
    </Text>
  );
}

/**
 * Besin adı alanı + tablodan öneri listesi.
 *
 * Liste odak durumuna göre değil, "seçim yapıldı mı" durumuna göre kapanıyor:
 * React Native'de `onBlur` bazen listedeki `onPress`ten önce tetiklenip seçimi
 * düşürüyor, bu yüzden odak takibi hiç yapılmıyor.
 *
 * Seçim yapılınca metin kutusu yerini seçili besin kartına bırakıyor — ad iki
 * yerde birden durmasın diye.
 */
export function FoodSearchField({ value, onChangeText, selected, onSelect, onClear }: Props) {
  const palette = usePalette();

  const results = useMemo(() => (selected ? [] : searchFoods(value)), [selected, value]);
  const showList = !selected && normalizeFoodQuery(value).length >= 2 && results.length > 0;

  if (selected) {
    return (
      <View className="gap-2">
        <FieldLabel label="Besin" />
        <View className="flex-row items-center gap-3 rounded-lg border border-accent/40 bg-accent/10 p-3">
          <KcalBadge calories={selected.per100g.calories} />
          <View className="flex-1 gap-0.5">
            <Text variant="body" numberOfLines={2}>
              {selected.name}
            </Text>
            <FoodMeta entry={selected} />
          </View>
          <Pressable
            onPress={onClear}
            accessibilityRole="button"
            accessibilityLabel="Seçili besini kaldır ve yeniden ara"
            hitSlop={touchTarget.slop}
            style={({ pressed }) => ({ opacity: pressed ? pressedOpacity : 1 })}
          >
            <X size={18} strokeWidth={2} color={rgb(palette.textMuted)} />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="gap-2">
      <Field
        label="Besin"
        value={value}
        onChangeText={onChangeText}
        placeholder="Tavuk göğsü"
        maxLength={80}
        autoCorrect={false}
      />

      {showList ? (
        <View
          className="overflow-hidden rounded-lg border border-border bg-elevated"
          accessibilityRole="list"
        >
          {results.map((entry, i) => (
            <View key={entry.id}>
              {i > 0 ? (
                <View className="h-px bg-border" style={{ marginLeft: BADGE_COLUMN }} />
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${entry.name}, 100 gramda ${Math.round(entry.per100g.calories)} kalori`}
                onPress={() => onSelect(entry)}
                style={({ pressed }) => ({
                  minHeight: touchTarget.min + 12,
                  opacity: pressed ? pressedOpacity : 1,
                })}
                className="flex-row items-center gap-3 px-3 py-2.5"
              >
                <KcalBadge calories={entry.per100g.calories} />
                <View className="flex-1 gap-0.5">
                  <Text variant="body" numberOfLines={1}>
                    {entry.name}
                  </Text>
                  <FoodMeta entry={entry} />
                </View>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
