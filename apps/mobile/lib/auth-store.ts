import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";

import { supabase } from "./supabase";

interface AuthState {
  session: Session | null;
  /** Supabase'in kayıtlı oturumu okuması bitene kadar true. */
  loading: boolean;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  loading: true,
  setSession: (session) => set({ session, loading: false }),
}));

/**
 * Uygulama açılışında bir kez çağrılır. Oturum expo-secure-store'dan okunur
 * (docs/02 → token asla düz metin AsyncStorage'da tutulmaz).
 */
export function initAuth() {
  supabase.auth.getSession().then(({ data }) => {
    useAuthStore.getState().setSession(data.session);
  });

  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setSession(session);
  });

  return () => sub.subscription.unsubscribe();
}

/** docs/02 → "tüm cihazlardan çıkış yap" seçeneği. */
export async function signOut(scope: "local" | "global" = "local") {
  const { error } = await supabase.auth.signOut({ scope });
  if (error) throw error;
}
