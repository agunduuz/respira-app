import { View } from "react-native";

import { Icon, Text } from "@/components/ui";
import { cn } from "@/theme/cn";

/**
 * Ana eylemin altında duran, dokunma gerektirmeyen küçük bilgi bloğu (Lavanta
 * Blok: t300 zemin, dolgulu "auto_awesome" ikonu). Kullanıcıyı bir şeye
 * zorlamaz; göz atmaya değer, dolaylı bir içerik alanı sağlar.
 */
export function InfoTip({ text, className }: { text: string; className?: string }) {
  return (
    <View className={cn("flex-row items-start gap-3 rounded-card bg-t300 px-[18px] py-4", className)}>
      <Icon name="auto_awesome" size={22} className="text-t900" />
      <View className="flex-1 gap-1">
        <Text variant="label" className="text-t900">
          Biliyor muydun?
        </Text>
        <Text variant="bodySm" className="font-bodySemiBold text-t900">
          {text}
        </Text>
      </View>
    </View>
  );
}
