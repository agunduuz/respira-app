import type { NutritionPeriod } from "@respira/shared-types";
import { useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { Button, Card, Screen, Text } from "@/components/ui";
import { useNutritionReport } from "@/lib/nutrition-queries";
import { isSkiaUsable } from "@/lib/skia-available";
import { useThemeStore } from "@/theme/theme-store";
import { darkPalette, lightPalette } from "@/theme/tokens";

const victory = isSkiaUsable()
  ? (require("victory-native") as typeof import("victory-native"))
  : null;

const rgb = (c: string) => `rgb(${c.split(" ").join(", ")})`;

const LABELS: Record<NutritionPeriod, string> = {
  daily: "Günlük",
  weekly: "Haftalık",
  monthly: "Aylık",
};

/**
 * docs/04 raporlama.
 *
 * Kullanıcının açık isteği: haftalık/aylık raporlar öğünlerin kendisini değil
 * DEĞERLERİN karşılaştırmasını gösterir. Bu ekran hiçbir yerde öğün metni
 * göstermiyor — API zaten göndermiyor.
 */
export default function NutritionReportScreen() {
  const [period, setPeriod] = useState<NutritionPeriod>("weekly");
  const { data, isPending, isError } = useNutritionReport(period);
  const preference = useThemeStore((s) => s.preference);
  const palette = preference === "light" ? lightPalette : darkPalette;

  const points = (data?.buckets ?? [])
    .filter((b) => b.hasData)
    .map((b, i) => ({
      x: i,
      protein: Math.round(b.proteinG ?? 0),
      etiket: new Date(`${b.key}T00:00:00Z`).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      }),
    }));

  return (
    <Screen edges={["bottom"]}>
      <ScrollView contentContainerClassName="gap-4 p-4 pb-12">
        <View className="flex-row gap-2">
          {(Object.keys(LABELS) as NutritionPeriod[]).map((p) => (
            <Button
              key={p}
              title={LABELS[p]}
              variant={period === p ? "primary" : "secondary"}
              onPress={() => setPeriod(p)}
              className="flex-1"
            />
          ))}
        </View>

        {isPending ? (
          <View className="py-12">
            <ActivityIndicator />
          </View>
        ) : isError ? (
          <Card>
            <Text variant="bodySm" className="text-danger">
              Rapor yüklenemedi. Önce beslenme anketini tamamladığından emin ol.
            </Text>
          </Card>
        ) : !data || data.daysWithData === 0 ? (
          <Card>
            <Text variant="bodySm" muted>
              Bu dönemde detaylı modda girilmiş öğün yok. Rapor yalnızca besin
              değeri girilen öğünlerden oluşur.
            </Text>
          </Card>
        ) : (
          <>
            <Card className="gap-3">
              <Text variant="label" muted>
                GÜNLÜK ORTALAMA ({data.daysWithData} gün veri)
              </Text>
              <Metric label="Kalori" value={data.averages.calories} target={data.targets.calories} pct={data.vsTarget.calories} unit="kcal" />
              <Metric label="Protein" value={data.averages.proteinG} target={data.targets.proteinG} pct={data.vsTarget.proteinG} unit="g" />
              <Metric label="Karbonhidrat" value={data.averages.carbsG} target={data.targets.carbsG} pct={data.vsTarget.carbsG} unit="g" />
              <Metric label="Yağ" value={data.averages.fatG} target={data.targets.fatG} pct={data.vsTarget.fatG} unit="g" />
            </Card>

            <Card className="gap-3">
              <Text variant="title">Protein trendi</Text>
              {points.length < 2 ? (
                <Text variant="bodySm" muted>
                  Trend için en az iki günlük veri gerekiyor.
                </Text>
              ) : !victory ? (
                <View className="gap-1">
                  <Text variant="bodySm" muted>
                    Grafik bu platformda çizilemiyor. Günlük değerler:
                  </Text>
                  {points.map((p) => (
                    <Text key={p.x} variant="data" muted>
                      {p.etiket} — {p.protein} g
                    </Text>
                  ))}
                </View>
              ) : (
                <View style={{ height: 220 }}>
                  <victory.CartesianChart data={points} xKey="x" yKeys={["protein"]}>
                    {({ points: p }) => (
                      <victory.Line
                        points={p.protein}
                        color={rgb(palette.accent)}
                        strokeWidth={2.5}
                        curveType="monotoneX"
                      />
                    )}
                  </victory.CartesianChart>
                </View>
              )}
            </Card>

            <Card>
              <Text variant="bodySm" muted>
                {data.vsTarget.proteinG !== null
                  ? `Bu dönemde ortalama protein alımın hedefine göre %${data.vsTarget.proteinG}. Bu bir tıbbi değerlendirme değildir; kişiselleştirilmiş öneri için bir diyetisyene danışmanı tavsiye ederiz.`
                  : "Bu bir tıbbi değerlendirme değildir."}
              </Text>
            </Card>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function Metric({ label, value, target, pct, unit }: {
  label: string; value: number | null; target: number; pct: number | null; unit: string;
}) {
  return (
    <View className="flex-row items-baseline justify-between gap-3 border-b border-border pb-2">
      <Text variant="body">{label}</Text>
      <Text variant="data" muted>
        {value === null ? "—" : Math.round(value)} / {Math.round(target)} {unit}
        {pct === null ? "" : `  %${pct}`}
      </Text>
    </View>
  );
}
