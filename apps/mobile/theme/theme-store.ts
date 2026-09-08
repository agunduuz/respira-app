import { colorScheme } from "nativewind";
import { create } from "zustand";

export type ThemePreference = "dark" | "light" | "system";

/**
 * docs/01: "Karanlık mod varsayılan, açık mod ikinci seçenek olarak
 * desteklenmeli." Bu yüzden başlangıç değeri sistem tercihi değil, "dark".
 *
 * Kalıcılık (ayarlar ekranı geldiğinde) buraya eklenecek — token'lar gibi
 * hassas olmadığı için AsyncStorage yeterli, SecureStore gerekmez.
 */
interface ThemeState {
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: "dark",
  setPreference: (next) => {
    colorScheme.set(next);
    set({ preference: next });
  },
}));

/**
 * Uygulama açılışında bir kez çağrılır — NativeWind'i mağazayla senkronlar.
 *
 * Expo web statik render sırasında (SSR) DOM yok ve colorScheme.set() hata
 * fırlatıyor. Native'de `window` her zaman tanımlı olduğu için bu koruma
 * yalnızca sunucu geçişini atlar; ilk kare yine koyu temayla çizilir.
 */
export function initTheme() {
  if (typeof window === "undefined") return;
  colorScheme.set(useThemeStore.getState().preference);
}
