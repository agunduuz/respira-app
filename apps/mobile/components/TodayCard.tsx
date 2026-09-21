import type { LucideIcon } from "lucide-react-native";
import { ChevronRight } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Button, Text } from "@/components/ui";
import { cn } from "@/theme/cn";
import { FeatureTint, type Feature } from "@/theme/feature-theme";
import { touchTarget } from "@/theme/tokens";
import { rgb, usePalette } from "@/theme/use-palette";

interface Props {
  /** Satırın rengi bu modülün aksanından gelir (UI-004). */
  feature: Feature;
  icon: LucideIcon;
  title: string;
  /** Kartın tek satırlık durumu — "1.2 / 2.4 L", "18:42 kaldı" gibi. */
  status: string;
  actionLabel: string;
  onAction: () => void;
  /** Karta dokununca açılan detay ekranı. */
  onPress: () => void;
  /** Dikkat isteyen durum (mola zamanı) — aksan tonuyla öne çıkar. */
  highlight?: boolean;
  last?: boolean;
}

/**
 * Bugün ekranındaki modül satırı: ne durumda olduğunu söyler, en sık yapılan
 * eylemi yerinde sunar, detay için modülün kendi ekranına götürür.
 */
export function TodayCard({
  feature,
  icon: Icon,
  title,
  status,
  actionLabel,
  onAction,
  onPress,
  highlight,
  last,
}: Props) {
  return (
    <FeatureTint feature={feature}>
      <Inner
        icon={Icon}
        title={title}
        status={status}
        actionLabel={actionLabel}
        onAction={onAction}
        onPress={onPress}
        highlight={highlight}
        last={last}
      />
    </FeatureTint>
  );
}

function Inner({
  icon: Icon,
  title,
  status,
  actionLabel,
  onAction,
  onPress,
  highlight,
  last,
}: Omit<Props, "feature">) {
  const palette = usePalette();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${status}`}
      onPress={onPress}
      style={{ minHeight: touchTarget.min }}
      className={cn("px-5 py-4", !last && "border-b border-border", highlight && "bg-accent/10")}
    >
      {({ pressed }) => (
        <View className="gap-3" style={{ opacity: pressed ? 0.65 : 1 }}>
          <View className="flex-row items-center gap-3">
            <View
              className="items-center justify-center rounded-full bg-accent/10"
              style={{ width: 36, height: 36 }}
            >
              <Icon size={18} strokeWidth={1.75} color={rgb(palette.accent)} />
            </View>
            <View className="flex-1 gap-0.5">
              <Text variant="subhead">{title}</Text>
              <Text variant="bodySm" muted>
                {status}
              </Text>
            </View>
            <ChevronRight size={18} strokeWidth={1.75} color={rgb(palette.textMuted)} />
          </View>
          <Button title={actionLabel} variant={highlight ? "primary" : "secondary"} onPress={onAction} />
        </View>
      )}
    </Pressable>
  );
}
