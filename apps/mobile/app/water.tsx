import { WATER_QUICK_ADD_ML, computeExpectedIntakeMl, computeHourlyTargetMl } from "@respira/shared-types";
import { router } from "expo-router";
import { Bell, Droplet, Target, Trash2, Zap } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from "react-native";

import { FeatureIntro } from "@/components/FeatureIntro";
import { WaterWave } from "@/components/WaterWave";
import { Button, Card, Screen, Text } from "@/components/ui";
import {
  DEFAULT_QUIET_HOURS,
  cancelCategory,
  ensurePermission,
  scheduleRepeatingReminder,
} from "@/lib/notifications";
import {
  useDeleteIntake,
  useLogIntake,
  useTodayIntake,
  useWaterGoal,
  type WaterIntakeLogRow,
} from "@/lib/water-queries";
import { useThemeStore } from "@/theme/theme-store";
import { darkPalette, lightPalette, touchTarget } from "@/theme/tokens";

const rgb = (c: string) => `rgb(${c.split(" ").join(", ")})`;

export default function WaterScreen() {
  const { data: goalData, isPending } = useWaterGoal();
  const goal = goalData?.goal ?? null;
  const { data: intake } = useTodayIntake(!!goal);
  const log = useLogIntake();
  const del = useDeleteIntake();

  const preference = useThemeStore((s) => s.preference);
  const palette = preference === "light" ? lightPalette : darkPalette;

  const [customAmount, setCustomAmount] = useState("");
  const [notifyState, setNotifyState] = useState<"idle" | "on" | "denied">("idle");
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
  const hourlyMl = computeHourlyTargetMl({
    dailyTargetMl: goal.dailyTargetMl,
    wakeTime: goal.wakeTime,
    sleepTime: goal.sleepTime,
  });
  const reachedGoal = totalMl >= goal.dailyTargetMl;
  const behind = totalMl < expectedMl;

  function addAmount(ml: number) {
    log.mutate({ amountMl: ml });
  }

  function addCustom() {
    const ml = Number(customAmount);
    if (!Number.isFinite(ml) || ml <= 0) return;
    log.mutate({ amountMl: Math.round(ml) });
    setCustomAmount("");
  }

  async function enableReminders() {
    const granted = await ensurePermission();
    if (!granted) {
      setNotifyState("denied");
      return;
    }
    await scheduleRepeatingReminder({
      category: "water",
      title: "Su vakti",
      body: `Saatlik hedefin yaklaşık ${hourlyMl}ml. Bir bardak su iyi gelir.`,
      intervalSeconds: 3600,
      quietHours: goal ? { start: goal.sleepTime, end: goal.wakeTime } : DEFAULT_QUIET_HOURS,
    });
    setNotifyState("on");
  }

  return (
    <Screen edges={["top"]}>
      <ScrollView contentContainerClassName="items-center gap-6 p-4 pb-12">
        <View className="w-full gap-1">
          <Text variant="label" muted>
            SU
          </Text>
          <Text variant="displayLg">Bugün</Text>
        </View>

        <WaterWave
          ratio={ratio}
          accent={rgb(palette.accent)}
          surface={rgb(palette.surface)}
          trackColor={rgb(palette.border)}
        />

        <View className="items-center gap-1">
          <Text variant="displayXl">{totalMl}ml</Text>
          <Text variant="body" muted>
            hedefin {goal.dailyTargetMl}ml
          </Text>
          <Text variant="bodySm" className={behind ? "text-warm" : "text-text-muted"}>
            Şu ana kadar: {totalMl}ml içtin, hedefin {expectedMl}ml
          </Text>
          {reachedGoal ? (
            <Text variant="label" className="text-accent">
              Bugünkü hedefine ulaştın 🎉
            </Text>
          ) : null}
        </View>

        <Card className="w-full gap-3">
          <Text variant="label" muted>
            HIZLI EKLE
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {WATER_QUICK_ADD_ML.map((q) => (
              <Button
                key={q.ml}
                title={q.label}
                variant="secondary"
                icon={Droplet}
                iconColor={rgb(palette.accent)}
                onPress={() => addAmount(q.ml)}
                className="w-[48%]"
              />
            ))}
          </View>
          <View className="flex-row items-center gap-2">
            <TextInput
              accessibilityLabel="Özel miktar (ml)"
              placeholder="Özel miktar (ml)"
              keyboardType="number-pad"
              value={customAmount}
              onChangeText={setCustomAmount}
              style={{ minHeight: touchTarget.min }}
              className="flex-1 rounded-md border border-border-strong bg-surface px-4 font-data text-data text-text"
            />
            <Button title="Ekle" variant="secondary" onPress={addCustom} />
          </View>
        </Card>

        {intake?.logs && intake.logs.length > 0 ? (
          <Card className="w-full gap-3">
            <Text variant="title">Bugünün girişleri</Text>
            {intake.logs.map((entry, i) => (
              <IntakeRow
                key={entry.id}
                log={entry}
                last={i === intake.logs.length - 1}
                onDelete={() => del.mutate(entry.id)}
                deleting={del.isPending && del.variables === entry.id}
                mutedColor={rgb(palette.textMuted)}
                dangerColor={rgb(palette.danger)}
              />
            ))}
          </Card>
        ) : null}

        <Card className="w-full gap-3">
          <Text variant="title">Hatırlatmalar</Text>
          <Text variant="bodySm" muted>
            Saat başı hatırlatma yalnızca uyanıklık saatlerinde ({goal.wakeTime}-
            {goal.sleepTime}) gelir.
          </Text>
          <Button
            title={notifyState === "on" ? "Hatırlatmalar açık" : "Saat başı hatırlat"}
            variant={notifyState === "on" ? "secondary" : "primary"}
            onPress={enableReminders}
          />
          {notifyState === "on" ? (
            <Button
              title="Hatırlatmaları kapat"
              variant="ghost"
              onPress={async () => {
                await cancelCategory("water");
                setNotifyState("idle");
              }}
            />
          ) : null}
          {notifyState === "denied" ? (
            <Text variant="bodySm" className="text-warm">
              Bildirim izni verilmedi. Girişleri elle yapabilirsin.
            </Text>
          ) : null}
        </Card>

        <Button title="Hedefi düzenle" variant="secondary" onPress={() => router.push("/water-goal")} />
      </ScrollView>
    </Screen>
  );
}

/** Yanlış eklenen bir girişi geri almak için — her satırda tek dokunuşla sil. */
function IntakeRow({
  log,
  last,
  onDelete,
  deleting,
  mutedColor,
  dangerColor,
}: {
  log: WaterIntakeLogRow;
  last: boolean;
  onDelete: () => void;
  deleting: boolean;
  mutedColor: string;
  dangerColor: string;
}) {
  const time = new Date(log.loggedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

  return (
    <View
      className={`flex-row items-center justify-between gap-3 pb-3${last ? "" : " border-b border-border"}`}
    >
      <View className="flex-row items-baseline gap-2">
        <Text variant="body">{log.amountMl}ml</Text>
        <Text variant="bodySm" muted>
          {time}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${log.amountMl}ml girişini sil`}
        onPress={onDelete}
        disabled={deleting}
        hitSlop={10}
        style={{ minWidth: touchTarget.min, minHeight: touchTarget.min }}
        className="items-center justify-center"
      >
        {({ pressed }) => (
          <Trash2
            size={18}
            strokeWidth={1.75}
            color={deleting ? mutedColor : dangerColor}
            opacity={pressed ? 0.65 : 1}
          />
        )}
      </Pressable>
    </View>
  );
}
