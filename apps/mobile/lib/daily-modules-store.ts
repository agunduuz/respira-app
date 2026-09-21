import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const STORAGE_KEY = "respira.dailyModules.v1";

/** Anasayfadaki "Günün önerileri"nde yer alabilen modüller. */
export const DAILY_MODULES = ["eye", "water", "posture", "stress"] as const;
export type DailyModule = (typeof DAILY_MODULES)[number];

type Enabled = Record<DailyModule, boolean>;

const ALL_ON: Enabled = { eye: true, water: true, posture: true, stress: true };

interface DailyModulesState {
  enabled: Enabled;
  hydrated: boolean;
  set: (module: DailyModule, on: boolean) => void;
  hydrate: () => Promise<void>;
}

/**
 * Kullanıcının günlük öneri listesinde görmek istediği modüller. Hassas veri
 * değil, yalnızca görünüm tercihi — AsyncStorage yeterli. Varsayılan: hepsi açık.
 */
export const useDailyModulesStore = create<DailyModulesState>((setState, get) => ({
  enabled: ALL_ON,
  hydrated: false,

  set: (module, on) => {
    const next = { ...get().enabled, [module]: on };
    setState({ enabled: next });
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
      // Yazılamazsa bu oturumda geçerli kalır — zararsız.
    });
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Enabled>;
        // Sonradan eklenen bir modül kayıtta yoksa açık kalsın.
        setState({ enabled: { ...ALL_ON, ...saved } });
      }
    } catch {
      // Bozuk kayıt: varsayılanla devam.
    } finally {
      setState({ hydrated: true });
    }
  },
}));
