import { useState } from "react";
import { KeyboardAvoidingView, Platform, TextInput, View } from "react-native";

import { Button, Card, Screen, Text } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { touchTarget } from "@/theme/tokens";

type Step = "email" | "code";

/**
 * docs/02 → Kimlik doğrulama: Supabase Auth, e-posta OTP.
 * Parola tutmuyoruz; kullanıcıya 6 haneli tek kullanımlık kod gönderiliyor.
 * Oturum token'ı expo-secure-store'da şifreli saklanır (lib/supabase.ts).
 */
export default function SignInScreen() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "rounded-md border border-border-strong bg-surface px-4 text-body text-text font-body";

  async function sendCode() {
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setStep("code");
  }

  async function verify() {
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });
    setBusy(false);
    if (err) setError(err.message);
    // Başarılıysa onAuthStateChange tetiklenir ve yönlendirmeyi kapı yapar.
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center p-6"
      >
        <View className="gap-2">
          <Text variant="displayLg">Respira</Text>
          <Text variant="bodySm" muted>
            Girmek için e-posta adresine tek kullanımlık bir kod gönderiyoruz.
          </Text>
        </View>

        <Card className="mt-6 gap-4">
          {step === "email" ? (
            <>
              <View className="gap-2">
                <Text variant="label" muted>
                  E-POSTA
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="ornek@eposta.com"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  inputMode="email"
                  accessibilityLabel="E-posta adresi"
                  style={{ minHeight: touchTarget.min }}
                  className={inputClass}
                />
              </View>
              <Button
                title="Kod gönder"
                onPress={sendCode}
                loading={busy}
                disabled={!email.includes("@")}
              />
            </>
          ) : (
            <>
              <View className="gap-2">
                <Text variant="label" muted>
                  DOĞRULAMA KODU
                </Text>
                <Text variant="bodySm" muted>
                  {email} adresine gönderilen 6 haneli kodu gir.
                </Text>
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  placeholder="000000"
                  keyboardType="number-pad"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  accessibilityLabel="Doğrulama kodu"
                  style={{ minHeight: touchTarget.min }}
                  className={`${inputClass} font-data tracking-widest`}
                />
              </View>
              <Button title="Doğrula" onPress={verify} loading={busy} disabled={code.length < 6} />
              <Button
                title="E-postayı değiştir"
                variant="ghost"
                onPress={() => {
                  setStep("email");
                  setCode("");
                  setError(null);
                }}
              />
            </>
          )}

          {error ? (
            <Text variant="bodySm" className="text-danger">
              {error}
            </Text>
          ) : null}
        </Card>
      </KeyboardAvoidingView>
    </Screen>
  );
}
