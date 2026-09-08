import { View, type ViewProps } from "react-native";

import { cn } from "@/theme/cn";

export interface CardProps extends ViewProps {
  /** Modal/öne çıkan içerik için bir kademe yükseltilmiş yüzey. */
  elevated?: boolean;
  className?: string;
}

export function Card({ elevated = false, className, ...rest }: CardProps) {
  return (
    <View
      className={cn(
        "rounded-lg border border-border p-4",
        elevated ? "bg-elevated" : "bg-surface",
        className
      )}
      {...rest}
    />
  );
}
