import { HABITS_PER_DAY, completedHabits } from "@respira/shared-types";
import { router, useIsFocused } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActivityCalendar, currentMonth, monthLabel } from "@/components/ActivityCalendar";
import { ThemeColorPicker } from "@/components/ThemeColorPicker";
import { Icon, Screen, Text, Toggle } from "@/components/ui";
import { useMonthlyActivity } from "@/lib/activity-queries";
import { useAuthStore } from "@/lib/auth-store";
import { useNutritionProfile } from "@/lib/nutrition-queries";
import { useReminders, type ReminderCategory } from "@/lib/use-reminders";
import { cn } from "@/theme/cn";

const formatLiters = (ml: number) => (ml / 1000).toFixed(1).replace(".", ",");

const NOTIFS: readonly {
  key: ReminderCategory;
  title: string;
  sub: string;
  icon: string;
  tone: string;
  setup?: "/water-goal" | "/posture-form";
}[] = [
  { key: "eye_strain", title: "Göz molası", sub: "20-20-20 · sayaçla birlikte", icon: "visibility", tone: "bg-t200" },
  { key: "posture", title: "Postür molası", sub: "Mesai saatlerinde", icon: "accessibility_new", tone: "bg-t400", setup: "/posture-form" },
  { key: "water", title: "Su hatırlatması", sub: "Uyanık saatlerine göre", icon: "water_drop", tone: "bg-t100", setup: "/water-goal" },
  { key: "stress", title: "Nefes check-in", sub: "Günlük egzersiz hatırlatması", icon: "self_improvement", tone: "bg-t300" },
];

/**
 * Profil (Lavanta Blok): koyu başlık bloğu, Tema rengi, bildirimler ve gizlilik.
 * Tasarımın dışındaki mevcut özellikler — aylık özet ve aktivite takvimi —
 * aynı blok diliyle altta duruyor. Hesap/veri işlemleri Ayarlar'da.
 */
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const email = useAuthStore((s) => s.session?.user?.email ?? "");
  const name = email.split("@")[0] || "Sen";
  const displayName = name.charAt(0).toLocaleUpperCase("tr-TR") + name.slice(1);
  const initials = name.slice(0, 2).toLocaleUpperCase("tr-TR");

  const { data: nutrition } = useNutritionProfile();
  const profile = nutrition?.profile ?? null;

  const reminders = useReminders();

  const [month, setMonth] = useState(() => currentMonth());
  const [selected, setSelected] = useState<string | null>(null);
  const { data, isPending } = useMonthlyActivity(month);

  const days = data?.days ?? [];
  const waterTargetMl = data?.waterTargetMl ?? null;
  const totals = data?.totals;
  const selectedDay = selected ? days.find((d) => d.date === selected) : undefined;

  return (
    <Screen edges={[]}>
      {/* Koyu başlık bloğu durum çubuğunun arkasına uzandığı için ikonlar açık olmalı. */}
      {focused ? <StatusBar style="light" /> : null}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-4 pb-[130px]">
        <View
          className="gap-4 rounded-b-sheet bg-t900 px-[22px] pb-6"
          style={{ paddingTop: insets.top + 14 }}
        >
          <View className="flex-row items-center gap-[14px]">
            <View className="h-[64px] w-[64px] items-center justify-center rounded-full bg-t300">
              <Text variant="displayLg" className="text-[22px]">
                {initials}
              </Text>
            </View>
            <View className="flex-1 gap-0.5">
              <Text variant="headline" className="text-[24px] text-white" numberOfLines={1}>
                {displayName}
              </Text>
              {email ? (
                <Text variant="bodySm" className="font-bodyMedium text-mut-l" numberOfLines={1}>
                  {email}
                </Text>
              ) : null}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ayarlar"
              onPress={() => router.push("/settings")}
              hitSlop={6}
              className="h-[44px] w-[44px] items-center justify-center rounded-full bg-white/10 active:scale-90"
            >
              <Icon name="settings" size={22} className="text-white" />
            </Pressable>
          </View>

          {profile ? (
            <View className="flex-row gap-[6px]">
              <StatChip label={`${profile.age} yaş`} tone="bg-t200" />
              <StatChip label={`${profile.heightCm} cm`} tone="bg-t100" />
              <StatChip label={`${profile.weightKg} kg`} tone="bg-t400" />
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Kişisel bilgileri ekle"
              onPress={() => router.push("/nutrition-survey")}
              className="items-center rounded-[18px] bg-t200 py-[10px]"
            >
              <Text variant="subhead">Yaş, boy, kilo — bilgilerini ekle</Text>
            </Pressable>
          )}
          {profile ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Kişisel bilgileri düzenle"
              onPress={() => router.push("/nutrition-survey")}
              hitSlop={8}
              className="flex-row items-center gap-1 self-start"
            >
              <Icon name="edit" size={16} className="text-mut-l" />
              <Text variant="label" className="text-mut-l">
                Bilgilerimi düzenle · {profile.targetCalories} kcal hedef
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/* Tema rengi */}
        <View className="gap-[10px] px-[18px]">
          <Text variant="section" className="text-[20px]">
            Tema rengi
          </Text>
          <ThemeColorPicker />
        </View>

        {/* Bildirimler */}
        <View className="gap-[10px] px-[18px]">
          <Text variant="section" className="text-[20px]">
            Bildirimler
          </Text>
          <View className="gap-2">
            {NOTIFS.map((n) => (
              <View key={n.key} className="flex-row items-center gap-3 rounded-card bg-white py-[10px] pl-[10px] pr-3">
                <View className={cn("h-[42px] w-[42px] items-center justify-center rounded-full", n.tone)}>
                  <Icon name={n.icon} size={21} className="text-t900" />
                </View>
                <View className="flex-1">
                  <Text variant="subhead">{n.title}</Text>
                  <Text variant="caption" muted>
                    {n.sub}
                  </Text>
                </View>
                <Toggle
                  label={n.title}
                  value={reminders.isActive(n.key)}
                  onChange={() =>
                    void reminders.toggle(n.key).then((result) => {
                      if (result === "setup" && n.setup) router.push(n.setup);
                    })
                  }
                />
              </View>
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Öğün ve kan tahlili hatırlatmaları"
              onPress={() => router.push("/blood-test-reminder")}
              className="flex-row items-center gap-3 rounded-card bg-white py-[10px] pl-[10px] pr-3"
            >
              <View className="h-[42px] w-[42px] items-center justify-center rounded-full bg-t50">
                <Icon name="restaurant" size={21} className="text-t900" />
              </View>
              <View className="flex-1">
                <Text variant="subhead">Öğün ve kan tahlili</Text>
                <Text variant="caption" muted>
                  Öğün saatleri · 6 ayda bir tahlil
                </Text>
              </View>
              <Icon name="chevron_right" size={24} />
            </Pressable>
          </View>
          <Text variant="caption" muted className="px-[6px] leading-[18px]">
            Her özellik iznini ilk kullandığında ayrı ister. Hatırlatmalar cihazda zamanlanır; uygulama kapalıyken de çalışır.
          </Text>

          {/* Gizlilik */}
          <View className="mt-1 flex-row items-start gap-3 rounded-card bg-t300 p-[18px]">
            <Icon name="shield_lock" size={26} className="text-t900" />
            <View className="flex-1 gap-[10px]">
              <Text variant="bodySm" className="font-bodySemiBold leading-[20px] text-t900">
                Sağlık verin yalnızca sana açık: açık rıza + satır düzeyinde güvenlik (RLS).
              </Text>
              <View className="flex-row flex-wrap gap-2">
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push("/settings")}
                  className="rounded-[14px] bg-t900 px-3 py-2"
                >
                  <Text variant="caption" className="font-heavy text-white">
                    Rıza ayarları
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push("/settings")}
                  className="rounded-[14px] bg-white/60 px-3 py-2"
                >
                  <Text variant="caption" className="font-heavy">
                    Verilerimi indir
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Mevcut özellik: aylık özet */}
        <View className="gap-[10px] px-[18px]">
          <Text variant="section" className="text-[20px]">
            {monthLabel(month)} özeti
          </Text>
          <View className="flex-row flex-wrap gap-[10px]">
            <SummaryTile tone="bg-t200" icon="visibility" label="Göz molası" value={totals ? `${totals.eyeCompleted} mola` : "—"} />
            <SummaryTile
              tone="bg-t100"
              icon="water_drop"
              label="Su hedefi"
              value={waterTargetMl && totals ? `${totals.waterDaysOnTarget} gün tuttu` : "Hedef yok"}
            />
            <SummaryTile tone="bg-t400" icon="accessibility_new" label="Duruş molası" value={totals ? `${totals.postureCompleted} set` : "—"} />
            <SummaryTile tone="bg-t300" icon="self_improvement" label="Nefes egzersizi" value={totals ? `${totals.breathingCompleted} seans` : "—"} />
          </View>
        </View>

        {/* Mevcut özellik: aktivite takvimi */}
        <View className="gap-4 px-[18px]">
          <View className="gap-4 rounded-card bg-white p-4">
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
              <View className="gap-2 border-t-[1.5px] border-line pt-4">
                <Text variant="subhead">
                  {Number(selected.slice(-2))} {monthLabel(month)}
                </Text>
                {selectedDay ? (
                  <>
                    <Text variant="bodySm" muted>
                      {completedHabits(selectedDay, waterTargetMl)} / {HABITS_PER_DAY} alışkanlık tamamlandı
                    </Text>
                    <View className="gap-1">
                      <DayLine icon="visibility" text={`${selectedDay.eyeCompleted} göz molası`} />
                      <DayLine icon="water_drop" text={`${formatLiters(selectedDay.waterMl)} L su`} />
                      <DayLine icon="accessibility_new" text={`${selectedDay.postureCompleted} duruş seti`} />
                      <DayLine icon="self_improvement" text={`${selectedDay.breathingCompleted} nefes seansı`} />
                      <DayLine icon="restaurant" text={`${selectedDay.meals} öğün kaydı`} />
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
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function StatChip({ label, tone }: { label: string; tone: string }) {
  return (
    <View className={cn("flex-1 items-center rounded-[18px] py-[10px]", tone)}>
      <Text variant="subhead" className="font-black">
        {label}
      </Text>
    </View>
  );
}

function SummaryTile({ tone, icon, label, value }: { tone: string; icon: string; label: string; value: string }) {
  return (
    <View className={cn("min-h-[96px] w-[48.4%] gap-[6px] rounded-tile p-[14px]", tone)}>
      <Icon name={icon} size={22} className="text-t900" />
      <Text variant="caption" className="font-bodyMedium">
        {label}
      </Text>
      <Text variant="subhead" className="font-black">
        {value}
      </Text>
    </View>
  );
}

function DayLine({ icon, text }: { icon: string; text: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Icon name={icon} size={16} className="text-mut" />
      <Text variant="bodySm" muted>
        {text}
      </Text>
    </View>
  );
}
