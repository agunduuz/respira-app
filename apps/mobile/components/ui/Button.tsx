import { ActivityIndicator, Pressable, View, type PressableProps } from "react-native";

import { cn } from "@/theme/cn";
import { touchTarget } from "@/theme/tokens";
import { Text } from "./Text";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const container: Record<Variant, string> = {
  primary: "bg-accent",
  secondary: "bg-surface border border-border-strong",
  ghost: "bg-transparent",
  danger: "bg-danger",
};

const label: Record<Variant, string> = {
  primary: "text-on-accent",
  secondary: "text-text",
  ghost: "text-accent",
  danger: "text-on-danger",
};

export interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  title: string;
  variant?: Variant;
  loading?: boolean;
  className?: string;
}

/**
 * pro-rules gereği:
 * - dokunma hedefi en az 48dp (iOS 44pt + Android 48dp'yi birlikte karşılar)
 * - basma geri bildirimi opaklıkla, layout sınırlarını kaydırmadan
 * - devre dışı durum hem görsel hem semantik olarak işaretli
 */
export function Button({
  title,
  variant = "primary",
  loading = false,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      hitSlop={touchTarget.slop}
      style={{ minHeight: touchTarget.min }}
      className={cn(
        "flex-row items-center justify-center gap-2 rounded-lg px-6",
        container[variant],
        isDisabled && "opacity-40",
        className
      )}
      // Basma anında sadece opaklık değişir — boyut/konum sabit kalır.
      android_ripple={{ borderless: false }}
      {...rest}
    >
      {({ pressed }) => (
        <View
          className="flex-row items-center gap-2"
          style={{ opacity: pressed && !isDisabled ? 0.65 : 1 }}
        >
          {loading ? <ActivityIndicator size="small" /> : null}
          <Text variant="label" className={label[variant]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
