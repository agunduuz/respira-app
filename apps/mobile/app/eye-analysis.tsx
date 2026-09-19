import type { EyeStrainPeriod } from "@respira/shared-types";
import { CircleAlert, CircleCheck, CircleX, SkipForward } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { ProgressRing } from "@/components/ProgressRing";
import { Button, Card, Screen, Segmented, Text } from "@/components/ui";
import { useEyeStrainAnalytics } from "@/lib/eye-strain-queries";
import { isSkiaUsable } from "@/lib/skia-available";
import { useThemeStore } from "@/theme/theme-store";
import { darkPalette, lightPalette } from "@/theme/tokens";

const rgb = (c: string) => `rgb(${c.split(" ").join(", ")})`;

const PERIOD_OPTIONS = [
  { value: "daily", label: "Günlük" },
  { value: "weekly", label: "Haftalık" },
  { value: "monthly", label: "Aylık" },
] as const;

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
  const { data, isPending, isError, refetch, isRefetching } = useEyeStrainAnalytics(period);

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

        <Segmented options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />

        {isPending ? (
          <Card className="items-center justify-center gap-2 py-16">
            <ActivityIndicator color={rgb(palette.accent)} />
            <Text variant="bodySm" muted>
              Rapor hazırlanıyor…
            </Text>
          </Card>
        ) : isError ? (
          <View
            className="flex-row items-start gap-3 rounded-md border border-danger bg-danger/12 p-4"
            accessibilityRole="alert"
          >
            <CircleAlert size={18} strokeWidth={1.75} color={rgb(palette.danger)} />
            <View className="flex-1 gap-3">
              <Text variant="bodySm" className="text-danger">
                Rapor yüklenemedi. Bağlantını kontrol edip tekrar dene.
              </Text>
              <Button
                title="Tekrar dene"
                variant="secondary"
                onPress={() => refetch()}
                loading={isRefetching}
                className="self-start"
              />
            </View>
          </View>
        ) : (
          <>
            <Card className="flex-row items-center gap-5">
              <ProgressRing
                progress={totals?.complianceRate ?? 0}
                size={96}
                strokeWidth={9}
                color={rgb(palette.accent)}
                trackColor={rgb(palette.border)}
              >
                {ratePct === null ? (
                  <Text variant="label" muted>
                    —
                  </Text>
                ) : (
                  <Text variant="title">%{ratePct}</Text>
                )}
              </ProgressRing>
              <View className="flex-1 gap-1">
                <Text variant="label" muted>
                  UYUM ORANI
                </Text>
                {ratePct === null ? (
                  <Text variant="bodySm" muted>
                    Bu dönemde hiç mola tetiklenmedi.
                  </Text>
                ) : (
                  <Text variant="bodySm" muted>
                    {totals?.completed}/{totals?.triggered} mola tamamlandı
                  </Text>
                )}
              </View>
            </Card>

            <View className="flex-row gap-3">
              <StatTile
                Icon={CircleCheck}
                color={rgb(palette.accent)}
                label="Tamamlanan"
                value={totals?.completed ?? 0}
              />
              <StatTile
                Icon={SkipForward}
                color={rgb(palette.warm)}
                label="Atlanan"
                value={totals?.skipped ?? 0}
              />
              <StatTile
                Icon={CircleX}
                color={rgb(palette.danger)}
                label="Kaçırılan"
                value={totals?.missed ?? 0}
              />
            </View>

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

function StatTile({
  Icon,
  color,
  label,
  value,
}: {
  Icon: typeof CircleCheck;
  color: string;
  label: string;
  value: number;
}) {
  return (
    <Card className="flex-1 items-center gap-1.5 py-4">
      <Icon size={18} strokeWidth={1.75} color={color} />
      <Text variant="title">{value}</Text>
      <Text variant="label" muted>
        {label}
      </Text>
    </Card>
  );
}
