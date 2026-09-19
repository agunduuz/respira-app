import { CircleAlert, Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, TextInput, View } from "react-native";

import { BrandMark } from "@/components/BrandMark";
import { Button, Card, Screen, Segmented, Text } from "@/components/ui";
import { translateAuthError } from "@/lib/auth-errors";
import { supabase } from "@/lib/supabase";
import { useThemeStore } from "@/theme/theme-store";
import { darkPalette, lightPalette, touchTarget } from "@/theme/tokens";

const MODE_OPTIONS = [
  { value: "signin", label: "Giriş Yap" },
  { value: "signup", label: "Kayıt Ol" },
] as const;

type Mode = "signin" | "signup";

/**
 * docs/02 → Kimlik doğrulama: Supabase Auth, e-posta + şifre.
 * Oturum token'ı expo-secure-store'da şifreli saklanır (lib/supabase.ts).
 * Kayıtlı bir oturum varsa AuthGate bu ekranı hiç göstermeden anasayfaya
 * yönlendirir — "beni hatırla" davranışı ayrıca kodlanmaz.
 */
export default function SignInScreen() {
  const preference = useThemeStore((s) => s.preference);
  const palette = preference === "light" ? lightPalette : darkPalette;
  const rgb = (c: string) => `rgb(${c.split(" ").join(", ")})`;

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const inputClass =
    "flex-1 py-3 pr-4 text-body text-text font-body";
  const fieldClass =
    "flex-row items-center gap-2 rounded-md border border-border-strong bg-surface pl-4";

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setInfo(null);
    setConfirmPassword("");
  }

  async function signIn() {
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (err) setError(translateAuthError(err.message));
    // Başarılıysa onAuthStateChange tetiklenir ve yönlendirmeyi AuthGate yapar.
  }

  async function signUp() {
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    setBusy(true);
    setError(null);
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (err) {
      setError(translateAuthError(err.message));
      return;
    }
    if (data.session) {
      // Oturum döndü — onAuthStateChange tetiklenir, AuthGate anasayfaya yönlendirir.
      return;
    }
    // Bu e-postayla zaten bir hesap varsa Supabase hata dönmez; "Confirm email"
    // açıkken var olan kullanıcıyı gizlemek için boş identities ile 200 döner.
    if (data.user && data.user.identities?.length === 0) {
      setError("Bu e-posta adresiyle zaten bir hesap var. \"Giriş Yap\" sekmesini kullan.");
      return;
    }
    // Supabase projesinde "Confirm email" açıksa oturum hemen dönmez.
    setInfo("Hesabın oluşturuldu. E-postana gönderdiğimiz linke tıklayıp \"Giriş Yap\"tan devam et.");
    switchMode("signin");
    // Oturum döndüyse onAuthStateChange tetiklenir ve AuthGate anasayfaya yönlendirir.
  }

  const canSubmitSignIn = email.includes("@") && password.length > 0;
  const canSubmitSignUp = email.includes("@") && password.length >= 6 && confirmPassword.length >= 6;

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center p-6"
      >
        <View className="items-center gap-4">
          <BrandMark color={rgb(palette.accent)} />
          <View className="items-center gap-1">
            <Text variant="displayLg">Respira</Text>
            <Text variant="bodySm" muted className="text-center">
              Ekran başında geçen günü daha sağlıklı geçirmenin yolu.
            </Text>
          </View>
        </View>

        <Segmented className="mt-8" options={MODE_OPTIONS} value={mode} onChange={switchMode} />

        <Card className="mt-4 gap-4">
          <View className="gap-2">
            <Text variant="label" muted>
              E-POSTA
            </Text>
            <View className={fieldClass} style={{ minHeight: touchTarget.min }}>
              <Mail size={18} strokeWidth={1.75} color={rgb(palette.textMuted)} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="ornek@eposta.com"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                inputMode="email"
                accessibilityLabel="E-posta adresi"
                className={inputClass}
              />
            </View>
          </View>

          <View className="gap-2">
            <Text variant="label" muted>
              ŞİFRE
            </Text>
            <View className={fieldClass} style={{ minHeight: touchTarget.min }}>
              <Lock size={18} strokeWidth={1.75} color={rgb(palette.textMuted)} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="En az 6 karakter"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                accessibilityLabel="Şifre"
                className={inputClass}
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={touchTarget.slop}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                className="pr-4"
              >
                {showPassword ? (
                  <EyeOff size={18} strokeWidth={1.75} color={rgb(palette.textMuted)} />
                ) : (
                  <Eye size={18} strokeWidth={1.75} color={rgb(palette.textMuted)} />
                )}
              </Pressable>
            </View>
          </View>

          {mode === "signup" ? (
            <View className="gap-2">
              <Text variant="label" muted>
                ŞİFRE (TEKRAR)
              </Text>
              <View className={fieldClass} style={{ minHeight: touchTarget.min }}>
                <Lock size={18} strokeWidth={1.75} color={rgb(palette.textMuted)} />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Şifreni tekrar gir"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  accessibilityLabel="Şifre tekrar"
                  className={inputClass}
                />
              </View>
            </View>
          ) : null}

          {mode === "signin" ? (
            <Button title="Giriş Yap" onPress={signIn} loading={busy} disabled={!canSubmitSignIn} />
          ) : (
            <Button title="Hesap Oluştur" onPress={signUp} loading={busy} disabled={!canSubmitSignUp} />
          )}

          {info ? (
            <View
              className="flex-row items-start gap-2 rounded-md border border-accent bg-accent/12 p-3"
              accessibilityRole="alert"
            >
              <Text variant="bodySm" className="flex-1 text-accent">
                {info}
              </Text>
            </View>
          ) : null}

          {error ? (
            <View
              className="flex-row items-start gap-2 rounded-md border border-danger bg-danger/12 p-3"
              accessibilityRole="alert"
            >
              <CircleAlert size={18} strokeWidth={1.75} color={rgb(palette.danger)} />
              <Text variant="bodySm" className="flex-1 text-danger">
                {error}
              </Text>
            </View>
          ) : null}
        </Card>
      </KeyboardAvoidingView>
    </Screen>
  );
}
