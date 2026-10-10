import type { LucideIcon } from "lucide-react-native";
import { ActivityIndicator, Pressable, View, type PressableProps } from "react-native";

import { cn } from "@/theme/cn";
import { Text } from "./Text";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const container: Record<Variant, string> = {
  primary: "bg-t900",
  secondary: "border-[1.5px] border-line bg-white",
  ghost: "bg-transparent",
  danger: "bg-danger",
};

const label: Record<Variant, string> = {
  primary: "text-white",
  secondary: "text-t900",
  ghost: "text-t900",
  danger: "text-on-danger",
};

export interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  title: string;
  variant?: Variant;
  loading?: boolean;
  className?: string;
  /** Etiketten önce gösterilen ikon — rengi `iconColor` ile verilir (SVG, className rengi miras almaz). */
  icon?: LucideIcon;
  iconColor?: string;
}

/**
 * Lavanta Blok kapsül düğme: 58px yükseklik, tam yuvarlak, 800 ağırlık metin.
 * Birincil düğme t900 (koyu) zemin + beyaz metin. Basınca scale(.97) — layout
 * sınırları kaymaz.
 */
export function Button({
  title,
  variant = "primary",
  loading = false,
  disabled,
  className,
  icon: Icon,
  iconColor,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      hitSlop={6}
      style={{ minHeight: 58 }}
      className={cn(
        "flex-row items-center justify-center gap-2 rounded-full px-7 active:scale-[0.97]",
        container[variant],
        isDisabled && "opacity-40",
        className
      )}
      {...rest}
    >
      <View className="flex-row items-center gap-2">
        {loading ? <ActivityIndicator size="small" /> : null}
        {!loading && Icon ? <Icon size={18} strokeWidth={2} color={iconColor} /> : null}
        <Text variant="button" className={label[variant]}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}
