import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { DEFAULT_HUE } from "./tones";

const STORAGE_KEY = "respira.hue.v1";

/**
 * Kullanıcının seçtiği ana renk (0–360°). Hassas veri değil; AsyncStorage yeterli.
 * Tasarımdaki `setHue` + localStorage davranışının karşılığı.
 */
interface HueState {
  hue: number;
  hydrated: boolean;
  setHue: (hue: number) => void;
  hydrate: () => Promise<void>;
}

const clampHue = (v: number) => Math.min(360, Math.max(0, Math.round(v)));

export const useHueStore = create<HueState>((set) => ({
  hue: DEFAULT_HUE,
  hydrated: false,

  setHue: (hue) => {
    const next = clampHue(hue);
    set({ hue: next });
    void AsyncStorage.setItem(STORAGE_KEY, String(next)).catch(() => {
      // Yazılamazsa seçim bu oturumda geçerli kalır; sonraki açılışta varsayılana döner — zararsız.
    });
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const n = raw === null ? NaN : Number(raw);
      if (Number.isFinite(n)) set({ hue: clampHue(n) });
    } catch {
      // Okunamayan kayıtta varsayılan renk kalır.
    } finally {
      set({ hydrated: true });
    }
  },
}));
