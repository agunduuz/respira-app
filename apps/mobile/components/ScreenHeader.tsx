import { router } from "expo-router";
import type { ReactNode } from "react";
import { View } from "react-native";

import { IconButton, Text } from "@/components/ui";

export interface ScreenHeaderProps {
  title?: string;
  /** Geri düğmesi: varsayılan router.back(); false → gizle. */
  onBack?: (() => void) | false;
  /** Sağdaki ikon düğmesi (ör. "tune", "undo"). */
  right?: { icon: string; label: string; onPress: () => void } | ReactNode;
  variant?: "outline" | "light";
}

const isAction = (r: ScreenHeaderProps["right"]): r is { icon: string; label: string; onPress: () => void } =>
  !!r && typeof r === "object" && "icon" in r && "onPress" in r;

/**
 * Lavanta Blok ekran üst çubuğu: solda yuvarlak geri düğmesi, ortada başlık,
 * sağda isteğe bağlı ikon düğmesi. Ortadaki başlık her iki yanı 46px tuttuğu
 * için hep tam ortada durur.
 */
export function ScreenHeader({ title, onBack, right, variant = "outline" }: ScreenHeaderProps) {
  return (
    <View className="flex-row items-center justify-between">
      {onBack === false ? (
        <View style={{ width: 46, height: 46 }} />
      ) : (
        <IconButton
          icon="arrow_back"
          label="Geri"
          variant={variant}
          onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace("/")))}
        />
      )}
      {title ? (
        <Text variant="title" numberOfLines={1} className="flex-1 px-2 text-center font-black text-[20px]">
          {title}
        </Text>
      ) : (
        <View className="flex-1" />
      )}
      {isAction(right) ? (
        <IconButton icon={right.icon} label={right.label} variant={variant} iconSize={22} onPress={right.onPress} />
      ) : right ? (
        <View>{right}</View>
      ) : (
        <View style={{ width: 46, height: 46 }} />
      )}
    </View>
  );
}
