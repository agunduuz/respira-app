import { ChevronRight, type LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { Text, Toggle } from "@/components/ui";
import { cn } from "@/theme/cn";
import { FeatureTint, type Feature } from "@/theme/feature-theme";
import { touchTarget } from "@/theme/tokens";
import { rgb, usePalette } from "@/theme/use-palette";

interface Props {
  label: string;
  icon?: LucideIcon;
  /** İkon rozetinin rengi bu modülün aksanından gelir. */
  feature?: Feature;
  /** Sağ tarafta soluk gösterilen mevcut değer. */
  value?: string;
  /** Verilirse satır dokunulabilir olur ve ok gösterilir. */
  onPress?: () => void;
  /** Verilirse satır bir anahtardır (aç/kapa). */
  toggle?: { value: boolean; onChange: (next: boolean) => void };
  destructive?: boolean;
  right?: ReactNode;
}

export function SettingsRow({ feature, ...props }: Props) {
  if (feature) {
    return (
      <FeatureTint feature={feature}>
        <Inner {...props} />
      </FeatureTint>
    );
  }
  return <Inner {...props} />;
}

function Inner({ label, icon: Icon, value, onPress, toggle, destructive, right }: Omit<Props, "feature">) {
  const palette = usePalette();

  const content = (pressed: boolean) => (
    <View
      className="flex-row items-center gap-3 px-5 py-3"
      style={{ minHeight: touchTarget.min + 4, opacity: pressed ? 0.65 : 1 }}
    >
      {Icon ? (
        <View
          className={cn("items-center justify-center rounded-full", destructive ? "bg-danger/10" : "bg-t100")}
          style={{ width: 32, height: 32 }}
        >
          <Icon size={16} strokeWidth={1.75} color={rgb(destructive ? palette.danger : palette.accent)} />
        </View>
      ) : null}
      <Text variant="body" className={cn("flex-1", destructive && "text-danger")}>
        {label}
      </Text>
      {value ? (
        <Text variant="bodySm" muted>
          {value}
        </Text>
      ) : null}
      {toggle ? (
        <Toggle value={toggle.value} onChange={toggle.onChange} label={label} />
      ) : null}
      {right}
      {onPress && !toggle ? <ChevronRight size={18} strokeWidth={1.75} color={rgb(palette.textMuted)} /> : null}
    </View>
  );

  if (!onPress) return content(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}: ${value}` : label}
      onPress={onPress}
    >
      {({ pressed }) => content(pressed)}
    </Pressable>
  );
}
