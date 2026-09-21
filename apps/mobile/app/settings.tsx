import { DELETE_ACCOUNT_CONFIRMATION } from "@respira/shared-types";
import { Link } from "expo-router";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { ScrollView, TextInput, View } from "react-native";

import { Button, Card, Screen, Text } from "@/components/ui";
import { signOut, useAuthStore } from "@/lib/auth-store";
import { useDeleteAccount, useExportData, useRevokeConsent } from "@/lib/queries";
import { touchTarget } from "@/theme/tokens";

/** docs/02 → KVKK md. 11 hakları ve cihaz kaybı senaryosu. */
export default function SettingsScreen() {
  const email = useAuthStore((s) => s.session?.user.email);
  const exportData = useExportData();
  const deleteAccount = useDeleteAccount();
  const revoke = useRevokeConsent();
  const [confirmation, setConfirmation] = useState("");
  const [status, setStatus] = useState<string | null>(null);

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

  return (
    <Screen edges={["top"]}>
      <ScrollView contentContainerClassName="gap-6 p-4 pb-12">
        <Text variant="displayLg">Ayarlar</Text>

        <Card className="gap-1">
          <Text variant="label" muted>
            HESAP
          </Text>
          <Text variant="body">{email ?? "—"}</Text>
        </Card>

        <Card className="gap-3">
          <Text variant="title">Verilerim</Text>
          <Text variant="bodySm" muted>
            Tüm verilerini JSON olarak indirebilirsin (KVKK md. 11).
          </Text>
          <Button
            title="Verilerimi indir"
            variant="secondary"
            onPress={handleExport}
            loading={exportData.isPending}
          />
          {status ? (
            <Text variant="bodySm" muted>
              {status}
            </Text>
          ) : null}
          {exportData.isError ? (
            <Text variant="bodySm" className="text-danger">
              Dışa aktarma başarısız oldu.
            </Text>
          ) : null}
        </Card>

        <Card className="gap-3">
          <Text variant="title">Rıza</Text>
          <Text variant="bodySm" muted>
            Sağlık verilerinin işlenmesine verdiğin açık rızayı geri alabilirsin.
            Geri alırsan ilgili özellikleri kullanamazsın, hesabın açık kalır.
          </Text>
          <Button
            title="Açık rızamı geri al"
            variant="secondary"
            onPress={() => revoke.mutate("OZEL_NITELIKLI_VERI_RIZASI")}
            loading={revoke.isPending}
          />
        </Card>

        <Card className="gap-3">
          <Text variant="title">Kan tahlili</Text>
          <Text variant="bodySm" muted>
            Bir sonraki tahlil için takvim hatırlatması kurabilirsin.
          </Text>
          <Link href="/blood-test-reminder" asChild>
            <Button title="Hatırlatmayı yönet" variant="secondary" />
          </Link>
        </Card>

        <Card className="gap-3">
          <Text variant="title">Oturum</Text>
          <Button title="Çıkış yap" variant="secondary" onPress={() => signOut("local")} />
          <Button
            title="Tüm cihazlardan çıkış yap"
            variant="secondary"
            onPress={() => signOut("global")}
          />
        </Card>

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
            className="rounded-md border border-border-strong bg-surface px-4 font-data text-data text-text"
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
      </ScrollView>
    </Screen>
  );
}
