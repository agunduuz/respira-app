import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import type { TimerPhase, TimerState } from "./eye-strain-timer";

const STORAGE_KEY = "respira.eyeStrain.timer";

interface EyeStrainState extends TimerState {
  /** Planlanmış bildirim zamanları (ms) — kaçırılan molaları bulmak için. */
  scheduledAt: number[];
  /** Kullanıcının en son yanıtladığı mola anı (ms). */
  lastRespondedAt: number | null;
  hydrated: boolean;

  start: () => void;
  beginBreak: () => void;
  stop: () => void;
  respond: (at: number) => void;
  setScheduled: (times: number[]) => void;
  hydrate: () => Promise<void>;
}

/**
 * Sayaç durumu cihazda saklanıyor (hassas veri değil, SecureStore gerekmez).
 * Uygulama tamamen kapatılıp açıldığında sayaç kaldığı yerden devam etmeli —
 * bu yüzden faz ve başlangıç anı kalıcı.
 */
async function persist(state: Pick<EyeStrainState, "phase" | "startedAt" | "scheduledAt" | "lastRespondedAt">) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Depolama hatası sayacı çalıştırmaya engel değil — sessizce geç.
  }
}

export const useEyeStrainStore = create<EyeStrainState>((set, get) => ({
  phase: "idle",
  startedAt: null,
  scheduledAt: [],
  lastRespondedAt: null,
  hydrated: false,

  start: () => {
    const next = { phase: "working" as TimerPhase, startedAt: Date.now() };
    set(next);
    void persist({ ...next, scheduledAt: get().scheduledAt, lastRespondedAt: get().lastRespondedAt });
  },

  beginBreak: () => {
    const next = { phase: "breaking" as TimerPhase, startedAt: Date.now() };
    set(next);
    void persist({ ...next, scheduledAt: get().scheduledAt, lastRespondedAt: get().lastRespondedAt });
  },

  stop: () => {
    const next = { phase: "idle" as TimerPhase, startedAt: null };
    set(next);
    void persist({ ...next, scheduledAt: [], lastRespondedAt: get().lastRespondedAt });
  },

  respond: (at) => {
    set({ lastRespondedAt: at });
    const s = get();
    void persist({ phase: s.phase, startedAt: s.startedAt, scheduledAt: s.scheduledAt, lastRespondedAt: at });
  },

  setScheduled: (times) => {
    set({ scheduledAt: times });
    const s = get();
    void persist({ phase: s.phase, startedAt: s.startedAt, scheduledAt: times, lastRespondedAt: s.lastRespondedAt });
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<EyeStrainState>;
        set({
          phase: saved.phase ?? "idle",
          startedAt: saved.startedAt ?? null,
          scheduledAt: saved.scheduledAt ?? [],
          lastRespondedAt: saved.lastRespondedAt ?? null,
        });
      }
    } catch {
      // Bozuk kayıt varsa varsayılanlarla devam et.
    } finally {
      set({ hydrated: true });
    }
  },
}));
