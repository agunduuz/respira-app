import type { NutritionPeriod } from "@respira/shared-types";
import { router } from "expo-router";
import { ClipboardList } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { Button, Card, Screen, Segmented, Text } from "@/components/ui";
import { useNutritionReport } from "@/lib/nutrition-queries";
import { isSkiaUsable } from "@/lib/skia-available";
import { useThemeStore } from "@/theme/theme-store";
import { darkPalette, lightPalette } from "@/theme/tokens";

const victory = isSkiaUsable()
  ? (require("victory-native") as typeof import("victory-native"))
  : null;

const rgb = (c: string) => `rgb(${c.split(" ").join(", ")})`;

const PERIOD_OPTIONS = [
  { value: "daily", label: "Günlük" },
  { value: "weekly", label: "Haftalık" },
  { value: "monthly", label: "Aylık" },
] as const;

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
        <View className="gap-1">
          <Text variant="label" muted>
            RAPOR
          </Text>
          <Text variant="displayLg">Beslenme raporu</Text>
        </View>

        <Segmented options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />

        {isPending ? (
          <Card className="items-center justify-center gap-2 py-16">
            <ActivityIndicator color={rgb(palette.accent)} />
            <Text variant="bodySm" muted>
              Rapor hazırlanıyor…
            </Text>
          </Card>
        ) : isError ? (
          <Card>
            <Text variant="bodySm" className="text-danger">
              Rapor yüklenemedi. Önce beslenme anketini tamamladığından emin ol.
            </Text>
          </Card>
        ) : !data || data.daysWithData === 0 ? (
          <View className="items-center gap-6 py-10">
            <View className="items-center justify-center" style={{ width: 64, height: 64 }}>
              <View
                className="bg-accent"
                style={{ position: "absolute", width: 64, height: 64, borderRadius: 32, opacity: 0.12 }}
              />
              <View
                className="items-center justify-center rounded-full bg-elevated"
                style={{ width: 48, height: 48 }}
              >
                <ClipboardList size={22} strokeWidth={1.75} color={rgb(palette.accent)} />
              </View>
            </View>
            <View className="items-center gap-1 px-6">
              <Text variant="title" className="text-center">
                Bu {PERIOD_OPTIONS.find((p) => p.value === period)?.label.toLowerCase()} dönemde henüz rapor yok
              </Text>
              <Text variant="bodySm" muted className="text-center">
                Rapor, besin değeri girdiğin (detaylı mod) öğünlerden oluşuyor.
                Birkaç öğün ekledikten sonra buraya dönüp hedeflerinle
                karşılaştırmayı görebilirsin.
              </Text>
            </View>
            <Button title="Öğün eklemeye git" onPress={() => router.back()} />
          </View>
        ) : (
          <>
            <Card className="gap-3">
              <Text variant="label" muted>
                GÜNLÜK ORTALAMA ({data.daysWithData} gün veri)
              </Text>
              <Metric label="Kalori" value={data.averages.calories} target={data.targets.calories} pct={data.vsTarget.calories} unit="kcal" />
              <Metric label="Protein" value={data.averages.proteinG} target={data.targets.proteinG} pct={data.vsTarget.proteinG} unit="g" />
              <Metric label="Karbonhidrat" value={data.averages.carbsG} target={data.targets.carbsG} pct={data.vsTarget.carbsG} unit="g" />
              <Metric label="Yağ" value={data.averages.fatG} target={data.targets.fatG} pct={data.vsTarget.fatG} unit="g" last />
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

function Metric({ label, value, target, pct, unit, last }: {
  label: string; value: number | null; target: number; pct: number | null; unit: string; last?: boolean;
}) {
  return (
    <View className={`flex-row items-baseline justify-between gap-3 pb-2${last ? "" : " border-b border-border"}`}>
      <Text variant="body">{label}</Text>
      <Text variant="data" muted>
        {value === null ? "—" : Math.round(value)} / {Math.round(target)} {unit}
        {pct === null ? "" : `  %${pct}`}
      </Text>
    </View>
  );
}
