import type { FoodNutrients } from "@respira/shared-types";
import { View } from "react-native";

import { Text } from "@/components/ui";

interface Props {
  values: FoodNutrients;
  /** Hesabın hangi gramaja dayandığı — ör. "150 g için". */
  basis: string;
}

/**
 * Hesaplanan besin değerleri. Beş boş input yerine okunacak bir özet:
 * kalori display fontuyla öne çıkıyor (tokens: "sayaçlar ve büyük rakamlar"),
 * makrolar mono rakamla aynı sütun ritminde duruyor.
 */
export function MacroSummary({ values, basis }: Props) {
  const macros: { label: string; value: number | null }[] = [
    { label: "Protein", value: values.protein },
    { label: "Karb", value: values.carbs },
    { label: "Yağ", value: values.fat },
    { label: "Lif", value: values.fiber },
  ];

  return (
    <View className="gap-3 rounded-card bg-t100 p-4">
      <Text variant="label" muted>
        {basis}
      </Text>

      <View className="flex-row items-baseline gap-2">
        <Text variant="displayLg" className="text-t900">
          {values.calories}
        </Text>
        <Text variant="subhead" muted>
          kcal
        </Text>
      </View>

      <View className="flex-row gap-2">
        {macros.map((m) => (
          <View key={m.label} className="flex-1 gap-0.5">
            <Text variant="data">{m.value === null ? "—" : `${m.value} g`}</Text>
            <Text variant="label" muted>
              {m.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
