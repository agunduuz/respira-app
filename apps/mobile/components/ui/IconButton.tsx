import { Pressable, type PressableProps } from "react-native";

import { cn } from "@/theme/cn";
import { Icon } from "./Icon";

export interface IconButtonProps extends Omit<PressableProps, "children" | "style"> {
  icon: string;
  /** Erişilebilirlik adı — ikonun kendisi gizli olduğu için zorunlu. */
  label: string;
  /** outline: çizgili (varsayılan) · light: beyaz dolgu · dark: t900 dolgu */
  variant?: "outline" | "light" | "dark";
  size?: number;
  iconSize?: number;
  className?: string;
}

/** Tasarımdaki 46px yuvarlak ikon düğmesi; hitSlop ile dokunma alanı 48+ kalır. */
export function IconButton({
  icon,
  label,
  variant = "outline",
  size = 46,
  iconSize = 24,
  className,
  ...rest
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={Math.max(0, (48 - size) / 2 + 2)}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={cn(
        "items-center justify-center active:scale-90",
        variant === "outline" && "border-[1.5px] border-line",
        variant === "light" && "bg-white",
        variant === "dark" && "bg-t900",
        className
      )}
      {...rest}
    >
      <Icon name={icon} size={iconSize} className={variant === "dark" ? "text-white" : "text-t900"} />
    </Pressable>
  );
}
