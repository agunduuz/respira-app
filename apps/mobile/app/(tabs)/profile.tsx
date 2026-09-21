import { HABITS_PER_DAY, completedHabits } from "@respira/shared-types";
import { router } from "expo-router";
import { Droplet, Eye, PersonStanding, Settings, UtensilsCrossed, Wind } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

import { ActivityCalendar, currentMonth, monthLabel } from "@/components/ActivityCalendar";
import { Button, Card, Screen, Text } from "@/components/ui";
import { useMonthlyActivity } from "@/lib/activity-queries";
import { useAuthStore } from "@/lib/auth-store";
import { useNutritionProfile } from "@/lib/nutrition-queries";
import { FeatureTint, type Feature } from "@/theme/feature-theme";
import { touchTarget } from "@/theme/tokens";
import { rgb, usePalette } from "@/theme/use-palette";

const formatLiters = (ml: number) => (ml / 1000).toFixed(1).replace(".", ",");

/**
 * Profil: kişisel bilgiler, aylık istatistikler ve aktivite takvimi.
 *
 * Teknik/hesap işlemleri (veri indirme, rıza yönetimi, hesap silme) bilinçli
 * olarak burada DEĞİL — sağ üstteki dişliden açılan Ayarlar ekranında.
 */
export default function ProfileScreen() {
  const palette = usePalette();
  const email = useAuthStore((s) => s.session?.user?.email ?? null);
  const { data: nutrition } = useNutritionProfile();
  const profile = nutrition?.profile ?? null;

  const [month, setMonth] = useState(() => currentMonth());
  const [selected, setSelected] = useState<string | null>(null);
  const { data, isPending } = useMonthlyActivity(month);

  const days = data?.days ?? [];
  const waterTargetMl = data?.waterTargetMl ?? null;
  const totals = data?.totals;
  const selectedDay = selected ? days.find((d) => d.date === selected) : undefined;

  return (
    <Screen edges={["top"]}>
      <ScrollView contentContainerClassName="gap-6 p-5 pb-12">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-1">
            <Text variant="label" muted>
              PROFİL
            </Text>
            <Text variant="displayLg">Sen</Text>
            {email ? (
              <Text variant="bodySm" muted>
                {email}
              </Text>
            ) : null}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ayarlar"
            onPress={() => router.push("/settings")}
            hitSlop={8}
            style={{ minWidth: touchTarget.min, minHeight: touchTarget.min }}
            className="items-end justify-center"
          >
            {({ pressed }) => (
              <View
                className="items-center justify-center rounded-full bg-accent/10"
                style={{ width: 40, height: 40, opacity: pressed ? 0.65 : 1 }}
              >
                <Settings size={20} strokeWidth={1.75} color={rgb(palette.accent)} />
              </View>
            )}
          </Pressable>
        </View>

        <Card className="gap-4">
          <View className="flex-row items-baseline justify-between">
            <Text variant="title">Kişisel bilgiler</Text>
            <Button
              title={profile ? "Düzenle" : "Ekle"}
              variant="ghost"
              onPress={() => router.push("/nutrition-survey")}
            />
          </View>
          {profile ? (
            <View className="flex-row flex-wrap gap-y-3">
              <Stat label="Yaş" value={String(profile.age)} />
              <Stat label="Boy" value={`${profile.heightCm} cm`} />
              <Stat label="Kilo" value={`${profile.weightKg} kg`} />
              <Stat label="Günlük kalori" value={`${profile.targetCalories} kcal`} />
            </View>
          ) : (
            <Text variant="bodySm" muted>
              Beslenme anketini doldurduğunda yaş, boy, kilo ve hedeflerin burada görünür.
            </Text>
          )}
        </Card>

        <View className="gap-3">
          <Text variant="title">{monthLabel(month)} özeti</Text>
          <Card className="gap-0 p-0">
            <SummaryRow
              feature="goz"
              icon={Eye}
              label="Göz molası"
              value={totals ? `${totals.eyeCompleted} mola` : "—"}
            />
            <SummaryRow
              feature="su"
              icon={Droplet}
              label="Su hedefi"
              value={
                waterTargetMl && totals ? `${totals.waterDaysOnTarget} gün tuttu` : "Hedef yok"
              }
            />
            <SummaryRow
              feature="durus"
              icon={PersonStanding}
              label="Duruş molası"
              value={totals ? `${totals.postureCompleted} set` : "—"}
            />
            <SummaryRow
              feature="nefes"
              icon={Wind}
              label="Nefes egzersizi"
              value={totals ? `${totals.breathingCompleted} seans` : "—"}
              last
            />
          </Card>
        </View>

        <Card className="gap-4">
          {isPending ? (
            <View className="items-center py-6">
              <ActivityIndicator />
            </View>
          ) : (
            <ActivityCalendar
              month={month}
              days={days}
              waterTargetMl={waterTargetMl}
              selected={selected}
              onSelect={(date) => setSelected((prev) => (prev === date ? null : date))}
              onMonthChange={(next) => {
                setMonth(next);
                setSelected(null);
              }}
            />
          )}

          {selected ? (
            <View className="gap-2 border-t border-border pt-4">
              <Text variant="subhead">
                {Number(selected.slice(-2))} {monthLabel(month)}
              </Text>
              {selectedDay ? (
                <>
                  <Text variant="bodySm" muted>
                    {completedHabits(selectedDay, waterTargetMl)} / {HABITS_PER_DAY} alışkanlık
                    tamamlandı
                  </Text>
                  <View className="gap-1">
                    <DayLine icon={Eye} text={`${selectedDay.eyeCompleted} göz molası`} />
                    <DayLine icon={Droplet} text={`${formatLiters(selectedDay.waterMl)} L su`} />
                    <DayLine
                      icon={PersonStanding}
                      text={`${selectedDay.postureCompleted} duruş seti`}
                    />
                    <DayLine icon={Wind} text={`${selectedDay.breathingCompleted} nefes seansı`} />
                    <DayLine icon={UtensilsCrossed} text={`${selectedDay.meals} öğün kaydı`} />
                  </View>
                </>
              ) : (
                <Text variant="bodySm" muted>
                  Bu güne ait kayıt yok.
                </Text>
              )}
            </View>
          ) : (
            <Text variant="bodySm" muted>
              Bir güne dokunarak o günün ayrıntısını görebilirsin.
            </Text>
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="w-1/2 gap-0.5">
      <Text variant="bodySm" muted>
        {label}
      </Text>
      <Text variant="subhead">{value}</Text>
    </View>
  );
}

function SummaryRow({
  feature,
  icon: Icon,
  label,
  value,
  last,
}: {
  feature: Feature;
  icon: typeof Eye;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <FeatureTint feature={feature}>
      <SummaryRowInner icon={Icon} label={label} value={value} last={last} />
    </FeatureTint>
  );
}

function SummaryRowInner({
  icon: Icon,
  label,
  value,
  last,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
  last?: boolean;
}) {
  const palette = usePalette();

  return (
    <View
      className={"flex-row items-center gap-3 px-5 py-3.5" + (last ? "" : " border-b border-border")}
    >
      <View
        className="items-center justify-center rounded-full bg-accent/10"
        style={{ width: 32, height: 32 }}
      >
        <Icon size={16} strokeWidth={1.75} color={rgb(palette.accent)} />
      </View>
      <Text variant="subhead" className="flex-1">
        {label}
      </Text>
      <Text variant="data" muted>
        {value}
      </Text>
    </View>
  );
}

function DayLine({ icon: Icon, text }: { icon: typeof Eye; text: string }) {
  const palette = usePalette();

  return (
    <View className="flex-row items-center gap-2">
      <Icon size={14} strokeWidth={1.75} color={rgb(palette.textMuted)} />
      <Text variant="bodySm" muted>
        {text}
      </Text>
    </View>
  );
}
