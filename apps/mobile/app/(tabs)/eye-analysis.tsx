import type { EyeStrainPeriod } from "@respira/shared-types";
import { useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { Button, Card, Screen, Text } from "@/components/ui";
import { useEyeStrainAnalytics } from "@/lib/eye-strain-queries";
import { isSkiaUsable } from "@/lib/skia-available";
import { useThemeStore } from "@/theme/theme-store";
import { darkPalette, lightPalette } from "@/theme/tokens";

const rgb = (c: string) => `rgb(${c.split(" ").join(", ")})`;

const PERIOD_LABELS: Record<EyeStrainPeriod, string> = {
  daily: "Günlük",
  weekly: "Haftalık",
  monthly: "Aylık",
};

/** "2026-09-15" → "15 Eyl" ; "2026-09-15T14" → "14:00" */
function shortLabel(key: string, period: EyeStrainPeriod): string {
  if (period === "daily") return `${key.slice(11, 13)}:00`;
  const d = new Date(`${key}T00:00:00Z`);
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", timeZone: "UTC" });
}

/**
 * Victory Native, Skia üzerine kurulu ve modül seviyesinde CanvasKit'e
 * dokunuyor — statik import edilirse Skia'sız bir platformda (web) tüm ekranı
 * düşürüyor. Bu yüzden yalnızca Skia kullanılabilirken yükleniyor.
 */
const victory = isSkiaUsable()
  ? (require("victory-native") as typeof import("victory-native"))
  : null;

export default function EyeAnalysisScreen() {
  const [period, setPeriod] = useState<EyeStrainPeriod>("weekly");
  const preference = useThemeStore((s) => s.preference);
  const palette = preference === "light" ? lightPalette : darkPalette;
  const { data, isPending, isError } = useEyeStrainAnalytics(period);

  // Grafik "uyum yüzdesi"ni gösteriyor. Mola tetiklenmemiş kovalarda oran null;
  // bunu 0 olarak çizmek "hiç uymadı" yanılgısı yaratırdı, o yüzden atlıyoruz.
  const points = (data?.buckets ?? [])
    .filter((b) => b.complianceRate !== null)
    .map((b, i) => ({
      x: i,
      uyum: Math.round((b.complianceRate ?? 0) * 100),
      etiket: shortLabel(b.key, period),
    }));

  const totals = data?.totals;
  const ratePct =
    totals?.complianceRate === null || totals?.complianceRate === undefined
      ? null
      : Math.round(totals.complianceRate * 100);

  return (
    <Screen edges={["top"]}>
      <ScrollView contentContainerClassName="gap-6 p-4 pb-12">
        <View className="gap-1">
          <Text variant="label" muted>
            GÖZ ANALİZİ
          </Text>
          <Text variant="displayLg">Uyum</Text>
        </View>

        <View className="flex-row gap-2">
          {(Object.keys(PERIOD_LABELS) as EyeStrainPeriod[]).map((p) => (
            <Button
              key={p}
              title={PERIOD_LABELS[p]}
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
              Rapor yüklenemedi. Bağlantını kontrol edip tekrar dene.
            </Text>
          </Card>
        ) : (
          <>
            <Card className="gap-2">
              <Text variant="label" muted>
                UYUM ORANI
              </Text>
              {ratePct === null ? (
                <Text variant="title" muted>
                  Bu dönemde hiç mola tetiklenmedi.
                </Text>
              ) : (
                <View className="flex-row items-baseline gap-2">
                  <Text variant="displayXl">%{ratePct}</Text>
                  <Text variant="data" muted>
                    {totals?.completed}/{totals?.triggered} mola
                  </Text>
                </View>
              )}
              <View className="flex-row gap-4 pt-1">
                <Text variant="data" muted>
                  Tamamlanan {totals?.completed ?? 0}
                </Text>
                <Text variant="data" muted>
                  Atlanan {totals?.skipped ?? 0}
                </Text>
                <Text variant="data" muted>
                  Kaçırılan {totals?.missed ?? 0}
                </Text>
              </View>
            </Card>

            <Card className="gap-3">
              <Text variant="title">
                {period === "monthly" ? "Trend" : "Dönem dağılımı"}
              </Text>
              {points.length === 0 ? (
                <Text variant="bodySm" muted>
                  Grafik için henüz yeterli veri yok.
                </Text>
              ) : !victory ? (
                // Victory Native de Skia tabanlı; çizemediğimizde sayısal
                // özet kalıyor ki ekran işlevsiz olmasın.
                <View className="gap-1">
                  <Text variant="bodySm" muted>
                    Grafik bu platformda çizilemiyor. Dönem değerleri:
                  </Text>
                  {points.map((pt) => (
                    <Text key={pt.x} variant="data" muted>
                      {pt.etiket} — %{pt.uyum}
                    </Text>
                  ))}
                </View>
              ) : (
                <View style={{ height: 220 }}>
                  <victory.CartesianChart
                    data={points}
                    xKey="x"
                    yKeys={["uyum"]}
                    domain={{ y: [0, 100] }}
                  >
                    {({ points: p, chartBounds }) =>
                      period === "monthly" ? (
                        <victory.Line
                          points={p.uyum}
                          color={rgb(palette.accent)}
                          strokeWidth={2.5}
                          curveType="monotoneX"
                        />
                      ) : (
                        <victory.Bar
                          points={p.uyum}
                          chartBounds={chartBounds}
                          color={rgb(palette.accent)}
                          roundedCorners={{ topLeft: 6, topRight: 6 }}
                        />
                      )
                    }
                  </victory.CartesianChart>
                </View>
              )}
            </Card>

            <Card>
              <Text variant="bodySm" muted>
                {ratePct === null
                  ? "Sayacı başlatınca burada uyum oranını göreceksin."
                  : `Bu dönemde uyum oranın %${ratePct}. Düzenli mola vermek göz kuruluğu ve gerilim tipi baş ağrısı riskini azaltabilir.`}
              </Text>
            </Card>
          </>
        )}

        <Text variant="bodySm" muted>
          Bu bir tıbbi değerlendirme değildir.
        </Text>
      </ScrollView>
    </Screen>
  );
}
