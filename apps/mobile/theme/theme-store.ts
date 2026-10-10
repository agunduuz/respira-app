import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorScheme } from "nativewind";
import { create } from "zustand";

export type ThemePreference = "dark" | "light" | "system";

const STORAGE_KEY = "respira.theme.v1";
const VALID: readonly ThemePreference[] = ["dark", "light", "system"];

/**
 * docs/01: "Açık mod varsayılan, karanlık mod ikinci seçenek olarak
 * desteklenmeli." Bu yüzden başlangıç değeri sistem tercihi değil, "light".
 * Kullanıcı Ayarlar'dan değiştirirse seçim cihazda kalıcı (hassas veri değil,
 * AsyncStorage yeterli).
 */
interface ThemeState {
  preference: ThemePreference;
  hydrated: boolean;
  setPreference: (next: ThemePreference) => void;
  hydrate: () => Promise<void>;
}

/** NativeWind'in çalışma zamanı şeması; SSR'da (DOM yok) hata fırlattığı için korumalı. */
function applyScheme(_next: ThemePreference) {
  if (typeof window === "undefined") return;
  // Lavanta Blok yalnızca açık tema. Koyu tema tasarıma girene kadar NativeWind
  // her zaman "light"ta tutulur; tercih saklanmaya devam eder.
  colorScheme.set("light");
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: "light",
  hydrated: false,

  setPreference: (next) => {
    applyScheme(next);
    set({ preference: next });
    void AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // Yazılamazsa seçim bu oturumda geçerli kalır, bir sonraki açılışta varsayılana döner — zararsız.
    });
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw && (VALID as readonly string[]).includes(raw)) {
        applyScheme(raw as ThemePreference);
        set({ preference: raw as ThemePreference });
      }
    } catch {
      // Okunamayan kayıtta varsayılan (açık) kalır.
    } finally {
      set({ hydrated: true });
    }
  },
}));

/**
 * Şu an gerçekten koyu mu çiziliyor? "Sistem" seçiliyse cihazın ayarına bakar —
 * eskiden `preference !== "light"` koyu sayıyordu, "system" hep koyu çıkıyordu.
 */
export function useIsDark(): boolean {
  // Lavanta Blok tasarımında koyu tema yok — bkz. applyScheme.
  return false;
}

/**
 * Uygulama açılışında bir kez çağrılır — NativeWind'i mağazayla senkronlar.
 *
 * Expo web statik render sırasında (SSR) DOM yok ve colorScheme.set() hata
 * fırlatıyor. Native'de `window` her zaman tanımlı olduğu için bu koruma
 * yalnızca sunucu geçişini atlar; ilk kare yine açık temayla çizilir.
 */
export function initTheme() {
  applyScheme(useThemeStore.getState().preference);
}
