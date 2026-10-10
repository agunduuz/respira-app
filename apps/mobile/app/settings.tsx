import { DELETE_ACCOUNT_CONFIRMATION } from "@respira/shared-types";
import Constants from "expo-constants";
import { File, Paths } from "expo-file-system";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import {
  Bell,
  BookOpen,
  Database,
  Palette,
  Droplet,
  Eye,
  FileText,
  HeartPulse,
  LogOut,
  PersonStanding,
  ShieldOff,
  Target,
  Timer,
  Wind,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, ScrollView, TextInput } from "react-native";

import { PermissionHint } from "@/components/PermissionHint";
import { SettingsGroup } from "@/components/settings/SettingsGroup";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { Button, Card, Screen, Text } from "@/components/ui";
import { signOut, useAuthStore } from "@/lib/auth-store";
import { DAILY_MODULES, useDailyModulesStore, type DailyModule } from "@/lib/daily-modules-store";
import { useEyeStrainSettings } from "@/lib/eye-strain-queries";
import { useDeleteAccount, useExportData, useRevokeConsent } from "@/lib/queries";
import { usePostureProfile } from "@/lib/posture-queries";
import { useStressProfile } from "@/lib/stress-queries";
import { useReminders, type ReminderCategory } from "@/lib/use-reminders";
import { useWaterGoal } from "@/lib/water-queries";
import { useWelcomeStore } from "@/lib/welcome-store";
import { useHueStore } from "@/theme/hue-store";
import { hueName } from "@/theme/tones";
import { touchTarget } from "@/theme/tokens";

const DAILY_MODULE_LABEL: Record<DailyModule, string> = {
  eye: "Göz molası",
  water: "Su hedefi",
  posture: "Duruş molası",
  stress: "Nefes egzersizi",
};

const formatLiters = (ml: number) => `${(ml / 1000).toFixed(1).replace(".", ",")} L`;

/**
 * Ayarlar: kullanıcının uygulamayı kendi alışkanlıklarına göre şekillendirdiği
 * yer. Profil'den bilinçli olarak ayrı — veri indirme, rıza ve hesap silme gibi
 * teknik/hesap işlemleri burada (docs/02 → KVKK md. 11).
 */
export default function SettingsScreen() {
  const email = useAuthStore((s) => s.session?.user.email);
  const exportData = useExportData();
  const deleteAccount = useDeleteAccount();
  const revoke = useRevokeConsent();
  const [confirmation, setConfirmation] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const hue = useHueStore((s) => s.hue);
  const dailyEnabled = useDailyModulesStore((s) => s.enabled);
  const setDailyModule = useDailyModulesStore((s) => s.set);

  const reminders = useReminders();
  const { data: eyeSettings } = useEyeStrainSettings();
  const { data: waterData } = useWaterGoal();
  const { data: postureData } = usePostureProfile();
  const { data: stressData } = useStressProfile();

  const goal = waterData?.goal ?? null;
  const hasPosture = !!postureData?.profile;
  const stressPerDay = stressData?.profile?.desiredSessionsPerDay ?? null;

  async function handleExport() {
    setStatus(null);
    const data = await exportData.mutateAsync();

    // SDK 54+ dosya API'si: File/Paths. Önbellek dizinine yazıyoruz çünkü
    // dosya paylaşıldıktan sonra kalıcı olması gerekmiyor.
    const file = new File(Paths.cache, "respira-verilerim.json");
    file.create({ overwrite: true });
    file.write(JSON.stringify(data, null, 2));

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, {
        mimeType: "application/json",
        dialogTitle: "Respira verilerim",
      });
    } else {
      setStatus(`Dosya kaydedildi: ${file.uri}`);
    }
  }

  /** Anahtar açılırken kurulum eksikse (ör. su hedefi yok) ilgili kuruluma götürür. */
  async function toggleReminder(category: ReminderCategory, setupHref?: "/water-goal" | "/posture-form") {
    const result = await reminders.toggle(category);
    if (result === "setup" && setupHref) router.push(setupHref);
  }

  function confirmRevoke() {
    Alert.alert(
      "Açık rızayı geri al",
      "Geri alırsan ilgili özellikleri kullanamazsın, hesabın açık kalır. Devam edilsin mi?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Geri al",
          style: "destructive",
          onPress: () => revoke.mutate("OZEL_NITELIKLI_VERI_RIZASI"),
        },
      ]
    );
  }

  return (
    <Screen edges={["bottom"]}>
      <ScrollView contentContainerClassName="gap-6 p-5 pb-12">
        <SettingsGroup title="Görünüm">
          <SettingsRow
            icon={Palette}
            label="Tema rengi"
            value={hueName(hue)}
            onPress={() => router.push("/profile")}
          />
        </SettingsGroup>

        <SettingsGroup
          title="Hatırlatmalar"
          footer={
            reminders.permission === "denied" ? (
              <PermissionHint fallback="Hatırlatmaları açmak için cihaz ayarlarından izin ver." />
            ) : (
              "Her modülün kendi ekranında da aynı hatırlatmayı açıp kapatabilirsin."
            )
          }
        >
          <SettingsRow
            feature="goz"
            icon={Eye}
            label="Göz molası"
            toggle={{
              value: reminders.isActive("eye_strain"),
              onChange: () => void toggleReminder("eye_strain"),
            }}
          />
          <SettingsRow
            feature="su"
            icon={Droplet}
            label="Su"
            toggle={{
              value: reminders.isActive("water"),
              onChange: () => void toggleReminder("water", "/water-goal"),
            }}
          />
          <SettingsRow
            feature="durus"
            icon={PersonStanding}
            label="Duruş"
            toggle={{
              value: reminders.isActive("posture"),
              onChange: () => void toggleReminder("posture", "/posture-form"),
            }}
          />
          <SettingsRow
            feature="nefes"
            icon={Wind}
            label="Nefes"
            toggle={{
              value: reminders.isActive("stress"),
              onChange: () => void toggleReminder("stress"),
            }}
          />
        </SettingsGroup>

        <SettingsGroup title="Alışkanlıklar">
          <SettingsRow
            feature="goz"
            icon={Timer}
            label="Göz molası süreleri"
            value={eyeSettings ? `${eyeSettings.intervalMinutes} dk · ${eyeSettings.breakSeconds} sn` : undefined}
            onPress={() => router.push("/eye-strain-settings")}
          />
          <SettingsRow
            feature="su"
            icon={Target}
            label="Günlük su hedefi"
            value={goal ? formatLiters(goal.dailyTargetMl) : "Belirlenmedi"}
            onPress={() => router.push("/water-goal")}
          />
          <SettingsRow
            feature="durus"
            icon={PersonStanding}
            label="Duruş profili"
            value={hasPosture ? "Düzenle" : "Kurulmadı"}
            onPress={() => router.push("/posture-form")}
          />
          <SettingsRow
            feature="nefes"
            icon={HeartPulse}
            label="Nefes sıklığı"
            value={stressPerDay ? `Günde ${stressPerDay}` : "Ayarlanmadı"}
            onPress={() => router.push("/stress")}
          />
        </SettingsGroup>

        <SettingsGroup
          title="Günün önerileri"
          footer="Anasayfadaki listede görmek istediğin modülleri seç."
        >
          {DAILY_MODULES.map((module) => (
            <SettingsRow
              key={module}
              label={DAILY_MODULE_LABEL[module]}
              toggle={{ value: dailyEnabled[module], onChange: (on) => setDailyModule(module, on) }}
            />
          ))}
        </SettingsGroup>

        <SettingsGroup title="Yardım ve bilgi" footer="Bu uygulama bir sağlık hizmeti sağlamaz, yalnızca bir hatırlatma aracıdır.">
          <SettingsRow
            icon={BookOpen}
            label="Karşılama akışını yeniden gör"
            onPress={() => router.push("/(welcome)")}
          />
          <SettingsRow icon={FileText} label="Sürüm" value={Constants.expoConfig?.version ?? "—"} />
        </SettingsGroup>

        <SettingsGroup
          title="Gizlilik ve veri"
          footer={
            exportData.isError ? (
              <Text variant="bodySm" className="px-1 text-danger">
                Dışa aktarma başarısız oldu.
              </Text>
            ) : (
              (status ?? "Tüm verilerini JSON olarak indirebilirsin (KVKK md. 11).")
            )
          }
        >
          <SettingsRow icon={Database} label="Verilerimi indir" onPress={() => void handleExport()} />
          <SettingsRow icon={ShieldOff} label="Açık rızamı geri al" onPress={confirmRevoke} />
          <SettingsRow
            icon={Bell}
            label="Kan tahlili hatırlatması"
            onPress={() => router.push("/blood-test-reminder")}
          />
        </SettingsGroup>

        <SettingsGroup title="Hesap" footer={email ?? undefined}>
          <SettingsRow icon={LogOut} label="Çıkış yap" onPress={() => void signOut("local")} />
          <SettingsRow
            icon={LogOut}
            label="Tüm cihazlardan çıkış yap"
            onPress={() => void signOut("global")}
          />
        </SettingsGroup>

        {/* Geri dönüşü olmayan işlem — ayrı kart, yazarak onay. */}
        <Card className="gap-3 border-danger">
          <Text variant="title" className="text-danger">
            Hesabı sil
          </Text>
          <Text variant="bodySm" muted>
            Hesabın ve tüm sağlık verilerin geri dönüşsüz olarak silinir. Bu
            işlem geri alınamaz. Onaylamak için aşağıya{" "}
            <Text variant="bodySm" className="font-data">
              {DELETE_ACCOUNT_CONFIRMATION}
            </Text>{" "}
            yaz.
          </Text>
          <TextInput
            value={confirmation}
            onChangeText={setConfirmation}
            autoCapitalize="characters"
            autoCorrect={false}
            accessibilityLabel="Silme onayı"
            placeholder={DELETE_ACCOUNT_CONFIRMATION}
            style={{ minHeight: touchTarget.min }}
            className="rounded-md border border-border-strong bg-surface px-4 font-body text-body text-text"
          />
          <Button
            title="Hesabımı kalıcı olarak sil"
            variant="danger"
            disabled={confirmation !== DELETE_ACCOUNT_CONFIRMATION}
            loading={deleteAccount.isPending}
            onPress={async () => {
              await deleteAccount.mutateAsync(confirmation);
              await signOut("global");
            }}
          />
          {deleteAccount.isError ? (
            <Text variant="bodySm" className="text-danger">
              Silme başarısız oldu. Lütfen tekrar dene.
            </Text>
          ) : null}
        </Card>

        {__DEV__ ? (
          <Button
            title="Karşılama akışını sıfırla (geliştirici)"
            variant="ghost"
            onPress={async () => {
              await useWelcomeStore.getState().reset();
              await signOut("local");
            }}
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
}
