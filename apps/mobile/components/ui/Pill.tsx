import { View } from "react-native";

import { cn } from "@/theme/cn";
import { Text } from "./Text";

export interface PillProps {
  label: string;
  /** "soft": yarı saydam beyaz (renkli blok üstünde), "dark": t900, "line": çerçeveli. */
  variant?: "soft" | "dark" | "line";
  className?: string;
}

/** Bloğun köşesindeki küçük hap etiket (örn. "20-20-20", "Su", "TürKomp"). */
export function Pill({ label, variant = "soft", className }: PillProps) {
  return (
    <View
      className={cn(
        "self-start rounded-[12px] px-[11px] py-[5px]",
        variant === "soft" && "bg-white/55",
        variant === "dark" && "bg-t900",
        variant === "line" && "border-[1.5px] border-line",
        className
      )}
    >
      <Text variant="caption" className={variant === "dark" ? "text-white" : "text-t900"}>
        {label}
      </Text>
    </View>
  );
}
