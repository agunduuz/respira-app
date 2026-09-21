import type { RecordEyeStrainSessionInput } from "@respira/shared-types";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";

import { useRecordSessions } from "@/lib/eye-strain-queries";
import { useEyeStrainStore } from "@/lib/eye-strain-store";
import { findMissedTriggers } from "@/lib/notifications";
import { useEyeTimerView } from "@/lib/use-eye-timer";

/**
 * Sayacın ekrandan bağımsız çalışan kısmı: faz geçişi ve kaçırılan molaların
 * uzlaştırılması. Kök layout'a bir kez mount ediliyor — aksi hâlde kullanıcı
 * Göz ekranından ayrıldığında mola hiç başlamazdı.
 */
export function EyeTimerEngine() {
  const { view } = useEyeTimerView();
  const recordSessions = useRecordSessions();

  useEffect(() => {
    void useEyeStrainStore.getState().hydrate();
  }, []);

  // Çalışma fazı dolduğunda mola fazına geç.
  useEffect(() => {
    if (view.phase === "working" && view.elapsed) {
      useEyeStrainStore.getState().beginBreak();
    }
  }, [view.phase, view.elapsed]);

  // Mola süresi dolarsa kullanıcı yanıtlamamış demektir — otomatik tamamlandı
  // saymıyoruz; kullanıcı ekranı görüp karar verene kadar mola fazı kalıyor.

  // Uygulama öne geldiğinde kaçırılan molaları uzlaştır.
  const reconciling = useRef(false);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active" || reconciling.current) return;
      const s = useEyeStrainStore.getState();
      if (!s.hydrated || s.scheduledAt.length === 0) return;

      const missed = findMissedTriggers({
        scheduled: s.scheduledAt.map((t) => new Date(t)),
        now: new Date(),
        lastRespondedAt: s.lastRespondedAt ? new Date(s.lastRespondedAt) : null,
      });
      if (missed.length === 0) return;

      reconciling.current = true;
      const rows: RecordEyeStrainSessionInput[] = missed.map((d) => ({
        status: "MISSED",
        triggeredAt: d.toISOString(),
      }));
      recordSessions.mutate(rows, {
        onSettled: () => {
          reconciling.current = false;
        },
        onSuccess: () => s.respond(Date.now()),
      });
    });
    return () => sub.remove();
  }, [recordSessions]);

  return null;
}
