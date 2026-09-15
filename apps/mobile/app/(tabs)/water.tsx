import { WATER_QUICK_ADD_ML, computeExpectedIntakeMl, computeHourlyTargetMl } from "@respira/shared-types";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, TextInput, View } from "react-native";

import { WaterWave } from "@/components/WaterWave";
import { Button, Card, Screen, Text } from "@/components/ui";
import {
  DEFAULT_QUIET_HOURS,
  cancelCategory,
  ensurePermission,
  scheduleRepeatingReminder,
} from "@/lib/notifications";
import { useLogIntake, useTodayIntake, useWaterGoal } from "@/lib/water-queries";
import { useThemeStore } from "@/theme/theme-store";
import { darkPalette, lightPalette, touchTarget } from "@/theme/tokens";

const rgb = (c: string) => `rgb(${c.split(" ").join(", ")})`;

export default function WaterScreen() {
  const { data: goalData, isPending } = useWaterGoal();
  const goal = goalData?.goal ?? null;
  const { data: intake } = useTodayIntake(!!goal);
  const log = useLogIntake();

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
      <Screen edges={["top"]} className="justify-center p-6">
        <Card className="gap-3">
          <Text variant="title">Su hedefini belirle</Text>
          <Text variant="bodySm" muted>
            Kilona göre günlük bir hedef önerelim; istersen kendi hedefini de
            girebilirsin.
          </Text>
          <Button title="Hedefi ayarla" onPress={() => router.push("/water-goal")} />
        </Card>
      </Screen>
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
                onPress={() => addAmount(q.ml)}
                className="flex-1"
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
