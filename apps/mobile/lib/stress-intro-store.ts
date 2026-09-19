import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const STORAGE_KEY = "respira.stressIntro.v1";

interface StressIntroState {
  hasSeenIntro: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  markSeen: () => Promise<void>;
}

/**
 * Nefes/Stres sekmesinin çalışması için bir profil şart değil (Beslenme/Su/
 * Duruş'un aksine), o yüzden gerçek bir "kurulum" kapısı yok — ama diğer
 * sekmelerle aynı ilk karşılama hissini vermek için, cihazda tutulan bir
 * bayrakla YALNIZCA bir kez gösterilen tanıtım ekranı.
 */
export const useStressIntroStore = create<StressIntroState>((set) => ({
  hasSeenIntro: false,
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      set({ hasSeenIntro: raw === "true" });
    } catch {
      // Okunamazsa tanıtım tekrar gösterilir — zararsız.
    } finally {
      set({ hydrated: true });
    }
  },

  markSeen: async () => {
    set({ hasSeenIntro: true });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Yazılamazsa bir sonraki açılışta tekrar görünür — zararsız.
    }
  },
}));
