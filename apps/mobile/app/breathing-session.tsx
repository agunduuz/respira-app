import {
  BREATHING_TECHNIQUES,
  STRESS_LEGAL_NOTICE,
  type BreathingTechnique,
} from "@respira/shared-types";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";

import { BreathingOrb } from "@/components/BreathingOrb";
import { Button, Screen, Text } from "@/components/ui";
import { PHASE_LABELS, breathingStateAt } from "@/lib/breathing-cycle";
import { formatRemaining } from "@/lib/eye-strain-timer";
import { useRecordSession } from "@/lib/stress-queries";
import { useThemeStore } from "@/theme/theme-store";
import { darkPalette, lightPalette } from "@/theme/tokens";

const rgb = (c: string) => `rgb(${c.split(" ").join(", ")})`;

/** docs/07 — 5 dakikalık, seçilen tekniğin gerçek ritmine senkronize nefes egzersizi. */
export default function BreathingSessionScreen() {
  const params = useLocalSearchParams<{ technique: string; stressLevel?: string }>();
  const technique = (params.technique as BreathingTechnique) ?? "BOX";
  const def = BREATHING_TECHNIQUES[technique] ?? BREATHING_TECHNIQUES.BOX;
  const stressLevel = params.stressLevel ? Number(params.stressLevel) : null;

  const record = useRecordSession();

  const preference = useThemeStore((s) => s.preference);
  const palette = preference === "light" ? lightPalette : darkPalette;

  const startedAt = useRef(Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const elapsedSeconds = (now - startedAt.current) / 1000;
  const sessionRemaining = Math.max(0, def.sessionDurationSeconds - elapsedSeconds);
  const cycle = breathingStateAt(def.phases, elapsedSeconds);

  useEffect(() => {
    if (!finished && elapsedSeconds >= def.sessionDurationSeconds) {
      finish("COMPLETED");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsedSeconds, finished]);

  function finish(status: "COMPLETED" | "SKIPPED") {
    if (finished) return;
    setFinished(true);
    record.mutate({
      // params'tan gelen ham değer değil, def.technique — geçersiz/eksik bir
      // parametre gelirse bile sunucuya her zaman geçerli bir enum gider.
      technique: def.technique,
      stressLevel,
      durationSeconds: Math.round(Math.min(elapsedSeconds, def.sessionDurationSeconds)),
      status,
      triggeredAt: new Date(startedAt.current).toISOString(),
    });
    if (router.canGoBack()) router.back();
  }

  return (
    <Screen edges={["top"]} className="items-center justify-center gap-6 p-6">
      <View className="items-center gap-1">
        <Text variant="label" muted>
          {def.label.toLocaleUpperCase("tr-TR")}
        </Text>
        <Text variant="bodySm" muted>
          Kalan: {formatRemaining(sessionRemaining)}
        </Text>
      </View>

      <BreathingOrb
        phases={def.phases}
        running={!finished}
        accent={rgb(palette.accent)}
        surface={rgb(palette.surface)}
      />

      <View className="items-center gap-1">
        <Text variant="displayLg">{PHASE_LABELS[cycle.phase.type]}</Text>
        <Text variant="displayXl">{cycle.remainingInPhase}</Text>
      </View>

      <Text variant="bodySm" className="text-center">
        {def.instruction}
      </Text>

      <View className="w-full gap-2">
        <Button title="Bitir" onPress={() => finish("COMPLETED")} />
        <Button title="Atla" variant="ghost" onPress={() => finish("SKIPPED")} />
      </View>

      <Text variant="bodySm" muted className="text-center">
        {STRESS_LEGAL_NOTICE}
      </Text>
    </Screen>
  );
}
