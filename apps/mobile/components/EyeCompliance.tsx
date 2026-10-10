import type { EyeStrainPeriod } from "@respira/shared-types";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { Button, Segmented, Text } from "@/components/ui";
import { useEyeStrainAnalytics } from "@/lib/eye-strain-queries";
import { cn } from "@/theme/cn";

const PERIOD_OPTIONS = [
  { value: "daily", label: "Gün" },
  { value: "weekly", label: "Hafta" },
  { value: "monthly", label: "Ay" },
] as const;

/** "2026-09-15" → "15 Eyl" ; saatlik anahtar "2026-09-15T14" → "14" */
function shortLabel(key: string, period: EyeStrainPeriod): string {
  if (period === "daily") return key.slice(11, 13);
  const d = new Date(`${key}T00:00:00Z`);
  return period === "weekly"
    ? d.toLocaleDateString("tr-TR", { weekday: "short", timeZone: "UTC" })
    : d.toLocaleDateString("tr-TR", { day: "numeric", timeZone: "UTC" });
}

const BAR_AREA = 100;

/**
 * Lavanta Blok "Uyum" kartı: Gün/Hafta/Ay seçici, büyük uyum yüzdesi ve
 * yuvarlak uçlu çubuklar. Skia/Victory gerektirmez — saf View çubukları her
 * platformda (web dahil) çizilir. Mola tetiklenmemiş kovalar boş (soluk)
 * çubukla gösterilir; 0 uyumla karıştırılmaz.
 */
export function EyeCompliance({ initialPeriod = "weekly" }: { initialPeriod?: EyeStrainPeriod }) {
  const [period, setPeriod] = useState<EyeStrainPeriod>(initialPeriod);
  const { data, isPending, isError, refetch, isRefetching } = useEyeStrainAnalytics(period);

  const totals = data?.totals;
  const ratePct =
    totals?.complianceRate === null || totals?.complianceRate === undefined
      ? null
      : Math.round(totals.complianceRate * 100);

  const buckets = data?.buckets ?? [];
  const step = Math.max(1, Math.ceil(buckets.length / 7));
  const lastWithData = buckets.reduce((acc, b, i) => (b.complianceRate !== null ? i : acc), -1);

  return (
    <View className="gap-[18px] rounded-blockLg bg-white p-5">
      <View className="flex-row items-center justify-between">
        <Text variant="title" className="text-[19px] font-black">
          Uyum
        </Text>
        <Segmented options={PERIOD_OPTIONS} value={period} onChange={setPeriod} className="w-[180px]" />
      </View>

      {isPending ? (
        <View className="items-center gap-2 py-10">
          <ActivityIndicator />
          <Text variant="bodySm" muted>
            Rapor hazırlanıyor…
          </Text>
        </View>
      ) : isError ? (
        <View className="gap-3" accessibilityRole="alert">
          <Text variant="bodySm" className="text-danger">
            Rapor yüklenemedi. Bağlantını kontrol edip tekrar dene.
          </Text>
          <Button title="Tekrar dene" variant="secondary" onPress={() => refetch()} loading={isRefetching} className="self-start border-[1.5px] border-line" />
        </View>
      ) : (
        <>
          <View className="flex-row items-center gap-4">
            <Text variant="numHero" className="text-[54px]">
              {ratePct === null ? "—" : `%${ratePct}`}
            </Text>
            <View className="gap-[3px]">
              <Text variant="bodySm" className="font-bodySemiBold">
                {totals?.completed ?? 0} tamamlandı
              </Text>
              <Text variant="bodySm" muted className="font-bodySemiBold">
                {totals?.skipped ?? 0} atlandı
              </Text>
              {(totals?.missed ?? 0) > 0 ? (
                <Text variant="bodySm" muted className="font-bodySemiBold">
                  {totals?.missed} kaçırıldı
                </Text>
              ) : null}
            </View>
          </View>

          {ratePct === null ? (
            <Text variant="bodySm" muted>
              Bu dönemde hiç mola tetiklenmedi. Sayacı başlatınca uyum oranını burada göreceksin.
            </Text>
          ) : (
            <View className="flex-row items-end justify-between gap-[6px]" style={{ height: BAR_AREA + 24 }}>
              {buckets.map((b, i) => {
                const has = b.complianceRate !== null;
                const h = has ? Math.max(10, Math.round((b.complianceRate ?? 0) * BAR_AREA)) : 10;
                return (
                  <View key={b.key} className="flex-1 items-center gap-2">
                    <View
                      className={cn(
                        "w-full max-w-[26px] rounded-[13px]",
                        !has ? "bg-t50" : i === lastWithData ? "bg-t900" : "bg-t300"
                      )}
                      style={{ height: h }}
                    />
                    <Text variant="caption" muted className="h-[16px] text-[12px]">
                      {i % step === 0 ? shortLabel(b.key, period) : ""}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </>
      )}
    </View>
  );
}
