import { Pressable, View } from "react-native";

import { Icon, Text } from "@/components/ui";
import { cn } from "@/theme/cn";

export interface ModuleTileProps {
  /** Material Symbols adı. */
  icon: string;
  title: string;
  /** Tek satırlık durum — "1,2 / 2,0 L", "Sonraki molaya 18:42". */
  status: string;
  actionLabel: string;
  onAction: () => void;
  /** Karta dokununca açılan detay ekranı. */
  onPress: () => void;
  /** Blok tonu sınıfı (bg-t200…). */
  tone: string;
  /** Dikkat isteyen durum (mola zamanı). */
  highlight?: boolean;
  className?: string;
}

/**
 * Modüller ekranındaki blok: modülün durumunu söyler, en sık eylemi yerinde
 * sunar (koyu kapsül düğme), detay için modülün kendi ekranına götürür.
 */
export function ModuleTile({
  icon,
  title,
  status,
  actionLabel,
  onAction,
  onPress,
  tone,
  highlight,
  className,
}: ModuleTileProps) {
  const dark = tone === "bg-t900";

  return (
    <View className={cn("min-h-[188px] rounded-block", tone, className)}>
      {/* Kartın tamamı detaya götürür; eylem düğmesi iç içe düğme olmasın diye kardeş öğe (web geçerli HTML). */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${status}`}
        onPress={onPress}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 28 }}
        className="active:bg-white/30"
      />
      <View pointerEvents="box-none" className="flex-1 gap-2 p-4">
        <View pointerEvents="none" className="gap-2">
          <View className="flex-row items-center justify-between">
            <View className={cn("h-[40px] w-[40px] items-center justify-center rounded-full", dark ? "bg-t400" : "bg-white/60")}>
              <Icon name={icon} size={22} className="text-t900" />
            </View>
            {highlight ? <View className={cn("h-[10px] w-[10px] rounded-full", dark ? "bg-white" : "bg-t900")} /> : null}
          </View>
          <Text variant="title" className={cn("mt-2", dark && "text-white")}>
            {title}
          </Text>
          <Text variant="bodySm" className={cn("font-bodyMedium", dark && "text-mut-l")} numberOfLines={2}>
            {status}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          hitSlop={6}
          className={cn("mt-auto min-h-[40px] items-center justify-center self-start rounded-full px-4 active:scale-95", dark ? "bg-white" : "bg-t900")}
        >
          <Text variant="label" className={dark ? "text-t900" : "text-white"}>
            {actionLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
