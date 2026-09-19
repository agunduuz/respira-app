import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const STORAGE_KEY = "respira.welcome.v1";

interface WelcomeState {
  hasSeenWelcome: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  markSeen: () => Promise<void>;
}

/**
 * Karşılama (landing) akışının gösterilip gösterilmediğini cihazda tutar —
 * hassas veri değil, AsyncStorage yeterli. AuthGate bu bayrağı okuyup
 * oturumsuz kullanıcıyı ilk seferinde /(welcome)'a, sonrasında doğrudan
 * /sign-in'e yönlendirir.
 */
export const useWelcomeStore = create<WelcomeState>((set) => ({
  hasSeenWelcome: false,
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      set({ hasSeenWelcome: raw === "true" });
    } catch {
      // Bozuk/okunamayan kayıtta karşılama akışı tekrar gösterilir — zararsız.
    } finally {
      set({ hydrated: true });
    }
  },

  markSeen: async () => {
    set({ hasSeenWelcome: true });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Yazılamazsa bir sonraki açılışta akış tekrar görünür — zararsız.
    }
  },
}));
