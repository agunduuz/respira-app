import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

import { env } from "./env";

// Oturum token'ları cihazda şifreli saklanır — AsyncStorage'da düz metin DEĞİL.
// docs/02-VERI-MODELI-VE-GUVENLIK.md → "Kimlik doğrulama"
const secureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    // expo-secure-store native modül — web'de yok, orada varsayılan storage kullanılır.
    storage: Platform.OS === "web" ? undefined : secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Mobilde URL'den oturum algılama yok; deep link akışı ayrıca ele alınır.
    detectSessionInUrl: false,
  },
});
