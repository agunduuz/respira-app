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

/** docs/07 — 5 dakikalık, seçilen tekniğin gerçek ritmine senkronize nefes egzersizi. */
export default function BreathingSessionScreen() {
  const params = useLocalSearchParams<{ technique: string; stressLevel?: string }>();
  const technique = (params.technique as BreathingTechnique) ?? "BOX";
  const def = BREATHING_TECHNIQUES[technique] ?? BREATHING_TECHNIQUES.BOX;
  const stressLevel = params.stressLevel ? Number(params.stressLevel) : null;

  const record = useRecordSession();

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
    <View className="flex-1 bg-t300">
      <Screen transparent edges={["top", "bottom"]} className="items-center justify-center gap-5 px-5 py-4">
        <View className="items-center gap-1">
          <View className="rounded-[14px] bg-t900 px-[14px] py-[7px]">
            <Text variant="label" className="text-white">
              {def.label}
            </Text>
          </View>
          <Text variant="bodySm" className="mt-1 font-bodySemiBold">
            Kalan: {formatRemaining(sessionRemaining)}
          </Text>
        </View>

        <BreathingOrb phases={def.phases} running={!finished}>
          <Text variant="displayLg" className="text-[40px] leading-[50px]">
            {cycle.remainingInPhase}
          </Text>
          <Text variant="label" className="text-[15px] font-heavy">
            {PHASE_LABELS[cycle.phase.type]}
          </Text>
        </BreathingOrb>

        <Text variant="body" className="text-center font-bodyMedium">
          {def.instruction}
        </Text>

        <View className="w-full flex-row items-center gap-[10px]">
          <Button title="Seansı bitir" className="flex-1" onPress={() => finish("COMPLETED")} />
          <Button title="Atla" variant="secondary" className="w-[100px]" onPress={() => finish("SKIPPED")} />
        </View>

        <Text variant="caption" className="px-2 text-center font-bodyMedium">
          {STRESS_LEGAL_NOTICE}
        </Text>
      </Screen>
    </View>
  );
}
