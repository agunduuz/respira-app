import { Lightbulb } from "lucide-react-native";
import { View } from "react-native";

import { Text } from "@/components/ui";
import { cn } from "@/theme/cn";
import { rgb, usePalette } from "@/theme/use-palette";

/**
 * Ana eylemin altında duran, dokunma gerektirmeyen küçük bilgi kartı. Kullanıcıyı
 * bir şeye zorlamaz; ekrana göz atmaya değer, dolaylı bir içerik alanı sağlar.
 */
export function InfoTip({ text, className }: { text: string; className?: string }) {
  const palette = usePalette();

  return (
    <View className={cn("flex-row items-start gap-3 rounded-lg bg-accent/10 p-4", className)}>
      <Lightbulb size={18} strokeWidth={1.75} color={rgb(palette.accent)} />
      <View className="flex-1 gap-1">
        <Text variant="subhead" className="text-accent">
          Biliyor muydun?
        </Text>
        <Text variant="bodySm">{text}</Text>
      </View>
    </View>
  );
}
