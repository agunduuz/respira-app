import { View } from "react-native";

import { Button, Text } from "@/components/ui";
import { openSystemSettings } from "@/lib/use-reminders";

/**
 * Bildirim izni reddedilmişse: iOS bir kez reddedilen izni tekrar sorduramaz,
 * tek çıkış yolu cihaz ayarları. Kullanıcıyı sessiz bir başarısızlıkla
 * bırakmak yerine nedenini söyleyip oraya götürüyoruz.
 */
export function PermissionHint({ fallback }: { fallback: string }) {
  return (
    <View className="gap-2">
      <Text variant="bodySm" className="text-warm">
        Bildirim izni kapalı. {fallback}
      </Text>
      <Button title="Cihaz ayarlarını aç" variant="secondary" onPress={openSystemSettings} />
    </View>
  );
}
