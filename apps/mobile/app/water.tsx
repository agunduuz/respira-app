import { WATER_QUICK_ADD_ML, computeExpectedIntakeMl } from "@respira/shared-types";
import { router } from "expo-router";
import { Bell, Droplet, Target, Zap } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

import { FeatureIntro } from "@/components/FeatureIntro";
import { InfoTip } from "@/components/InfoTip";
import { PermissionHint } from "@/components/PermissionHint";
import { ScreenHeader } from "@/components/ScreenHeader";
import { WaterVessel } from "@/components/WaterVessel";
import { Button, Icon, Screen, Text } from "@/components/ui";
import {
  useDeleteIntake,
  useLogIntake,
  useTodayIntake,
  useWaterGoal,
  type WaterIntakeLogRow,
} from "@/lib/water-queries";
import { useNutritionProfile } from "@/lib/nutrition-queries";
import { WATER_TIPS, tipOfTheDay } from "@/lib/tips";
import { useReminders } from "@/lib/use-reminders";
import { cn } from "@/theme/cn";
import { touchTarget } from "@/theme/tokens";

export default function WaterScreen() {
  const { data: goalData, isPending } = useWaterGoal();
  const goal = goalData?.goal ?? null;
  const { data: intake } = useTodayIntake(!!goal);
  const log = useLogIntake();
  const del = useDeleteIntake();

  const [customMl, setCustomMl] = useState(150);
  const weightKg = useNutritionProfile().data?.profile?.weightKg;
  const reminders = useReminders();
  const reminderOn = reminders.isActive("water");
  const [now, setNow] = useState(() => new Date());

  // Referans çizgisi dakikada bir tazelensin — saat başı tetiklenen bir sayaç değil,
  // sadece "şu ana kadar" hesaplamasının güncel kalması için.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (isPending) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator />
      </Screen>
    );
  }

  if (!goal) {
    return (
      <FeatureIntro
        icon={Droplet}
        title="Su hedefini belirle"
        subtitle="Kilona göre günlük bir hedef önerelim; istersen kendi hedefini de girebilirsin."
        benefits={[
          { icon: Target, title: "Kişisel günlük hedef", body: "Kilona göre otomatik hesaplanır, istersen değiştirirsin." },
          { icon: Zap, title: "Tek dokunuşla ekle", body: "Bardak, şişe gibi hazır miktarlarla hızlıca kaydet." },
          { icon: Bell, title: "Saat başı hatırlatma", body: "Yalnızca uyanık olduğun saatlerde, nazikçe hatırlatır." },
        ]}
        ctaLabel="Hedefi ayarla"
        ctaIcon={Target}
        onPress={() => router.push("/water-goal")}
      />
    );
  }

  const totalMl = intake?.totalMl ?? 0;
  const ratio = goal.dailyTargetMl > 0 ? totalMl / goal.dailyTargetMl : 0;
  const expectedMl = computeExpectedIntakeMl({
    dailyTargetMl: goal.dailyTargetMl,
    wakeTime: goal.wakeTime,
    sleepTime: goal.sleepTime,
    now,
  });
  const expectedRatio = goal.dailyTargetMl > 0 ? Math.min(1, expectedMl / goal.dailyTargetMl) : 0;
  const reachedGoal = totalMl >= goal.dailyTargetMl;
  const diff = totalMl - expectedMl;
  const fmt = (n: number) => Math.round(n).toLocaleString("tr-TR");
  const logs = intake?.logs ?? [];

  function addAmount(ml: number) {
    log.mutate({ amountMl: ml });
  }

  // Son girişi geri al: tasarımdaki "undo" düğmesi — mevcut silme akışını kullanır.
  const lastLog = logs[0];

  return (
    <Screen edges={["top", "bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-[14px] px-[18px] pb-10 pt-2">
        <ScreenHeader
          title="Su"
          right={{
            icon: "undo",
            label: "Son girişi geri al",
            onPress: () => {
              if (lastLog) del.mutate(lastLog.id);
            },
          }}
        />

        <View className="flex-row items-stretch gap-3">
          <WaterVessel ratio={ratio} expected={expectedRatio} />
          <View className="flex-1 justify-between py-2">
            <View className="gap-1">
              <View className="self-start rounded-[12px] bg-t100 px-[11px] py-[5px]">
                <Text variant="caption">%{Math.round(Math.min(1, ratio) * 100)}</Text>
              </View>
              <Text variant="numHero" className="mt-[6px] text-[50px] leading-[50px]">
                {fmt(totalMl)}
              </Text>
              <Text variant="subhead" muted>
                / {fmt(goal.dailyTargetMl)} ml
              </Text>
              {reachedGoal ? (
                <Text variant="label" className="mt-1 text-t600">
                  Bugünkü hedefine ulaştın 🎉
                </Text>
              ) : null}
            </View>
            <View className="gap-[6px] border-t-[2.5px] border-dashed border-t900 pt-[10px]">
              <Text variant="subhead" className="text-[14px]">
                Şu ana kadar {fmt(expectedMl)} ml
              </Text>
              <Text variant="caption" muted className="leading-[17px]">
                {diff >= 0 ? `Planın ${fmt(diff)} ml önündesin.` : `Planın ${fmt(-diff)} ml gerisindesin.`}
              </Text>
            </View>
            <Text variant="caption" muted className="font-bodyMedium leading-[17px]">
              {weightKg ? `${weightKg} kg × 33 ml\n` : ""}
              {goal.wakeTime}–{goal.sleepTime} arası
            </Text>
          </View>
        </View>

        {/* Hızlı ekle blokları */}
        <View className="flex-row flex-wrap gap-[10px]">
          {WATER_QUICK_ADD_ML.map((q, i) => (
            <Pressable
              key={q.ml}
              accessibilityRole="button"
              accessibilityLabel={`${q.label} ekle`}
              onPress={() => addAmount(q.ml)}
              className={cn("w-[48.5%] gap-[14px] rounded-card p-4 active:scale-[0.96]", i % 2 === 0 ? "bg-t100" : "bg-t200")}
            >
              <Icon name={q.ml >= 1000 ? "water_bottle_large" : q.ml >= 500 ? "water_bottle" : "local_drink"} size={28} className="text-t900" />
              <Text variant="displayLg" className="text-[20px] leading-[22px]">
                +{q.ml >= 1000 ? `${q.ml / 1000} L` : `${q.ml} ml`}
                {"\n"}
                <Text variant="caption" className="text-[13px] font-bodyMedium">
                  {q.label.replace(/^\+?\s*/, "")}
                </Text>
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Özel miktar */}
        <View className="flex-row items-center gap-2 rounded-blockLg bg-t900 py-2 pl-5 pr-2">
          <Text variant="subhead" className="flex-1 text-white">
            Özel
          </Text>
          <StepButton label="Azalt" symbol="−" onPress={() => setCustomMl((v) => Math.max(50, v - 50))} />
          <Text variant="subhead" className="min-w-[64px] text-center text-[16px] font-black text-white">
            {customMl} ml
          </Text>
          <StepButton label="Artır" symbol="+" onPress={() => setCustomMl((v) => Math.min(1000, v + 50))} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${customMl} ml ekle`}
            onPress={() => addAmount(customMl)}
            className="h-[46px] justify-center rounded-full bg-t400 px-[18px]"
          >
            <Text variant="subhead" className="font-black text-t900">
              Ekle
            </Text>
          </Pressable>
        </View>

        {/* Bugünün girişleri */}
        {logs.length > 0 ? (
          <View className="gap-1 rounded-card bg-white p-4">
            <Text variant="title" className="mb-1">
              Bugünün girişleri
            </Text>
            {logs.map((entry, i) => (
              <IntakeRow
                key={entry.id}
                log={entry}
                last={i === logs.length - 1}
                onDelete={() => del.mutate(entry.id)}
                deleting={del.isPending && del.variables === entry.id}
              />
            ))}
          </View>
        ) : null}

        <InfoTip text={tipOfTheDay(WATER_TIPS)} />

        {/* Hatırlatmalar */}
        <View className="gap-3 rounded-card bg-white p-4">
          <Text variant="title">Hatırlatmalar</Text>
          <Text variant="bodySm" muted>
            Saat başı hatırlatma yalnızca uyanıklık saatlerinde ({goal.wakeTime}-{goal.sleepTime}) gelir.
          </Text>
          <Button
            title={reminderOn ? "Hatırlatmalar açık" : "Saat başı hatırlat"}
            variant={reminderOn ? "secondary" : "primary"}
            className={reminderOn ? "border-[1.5px] border-line" : undefined}
            onPress={() => void reminders.enable("water")}
          />
          {reminderOn ? (
            <Button title="Hatırlatmaları kapat" variant="ghost" onPress={() => void reminders.disable("water")} />
          ) : null}
          {reminders.permission === "denied" ? <PermissionHint fallback="Girişleri elle yapabilirsin." /> : null}
        </View>

        <Button
          title="Hedefi düzenle"
          variant="secondary"
          className="border-[1.5px] border-line"
          onPress={() => router.push("/water-goal")}
        />
      </ScrollView>
    </Screen>
  );
}

function StepButton({ label, symbol, onPress }: { label: string; symbol: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      className="h-[38px] w-[38px] items-center justify-center rounded-full bg-white/15 active:scale-90"
    >
      <Text variant="button" className="text-[18px] text-white">
        {symbol}
      </Text>
    </Pressable>
  );
}

/** Yanlış eklenen bir girişi geri almak için — her satırda tek dokunuşla sil. */
function IntakeRow({
  log,
  last,
  onDelete,
  deleting,
}: {
  log: WaterIntakeLogRow;
  last: boolean;
  onDelete: () => void;
  deleting: boolean;
}) {
  const time = new Date(log.loggedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

  return (
    <View className={cn("flex-row items-center justify-between gap-3 py-1", !last && "border-b-[1.5px] border-line")}>
      <View className="flex-row items-baseline gap-2">
        <Text variant="subhead">{log.amountMl} ml</Text>
        <Text variant="bodySm" muted>
          {time}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${log.amountMl} ml girişini sil`}
        onPress={onDelete}
        disabled={deleting}
        hitSlop={10}
        style={{ minWidth: touchTarget.min, minHeight: touchTarget.min, opacity: deleting ? 0.4 : 1 }}
        className="items-center justify-center"
      >
        <Icon name="delete" size={22} className="text-danger" />
      </Pressable>
    </View>
  );
}
