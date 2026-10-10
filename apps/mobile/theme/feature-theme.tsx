import { usePathname } from "expo-router";
import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";

export type Feature = "kurumsal" | "goz" | "beslenme" | "su" | "durus" | "nefes";

/**
 * Lavanta Blok'ta her modül KENDİ aksan rengini değil, aynı ana renk ölçeğinden
 * kendi ton bloğunu alır (göz t200, su t100, stres t300…). Bu yüzden modül başına
 * aksan değişimi kalktı; `Feature` yalnızca blok tonunu seçmek için kullanılıyor.
 */
export const featureTone: Record<Feature, "t100" | "t200" | "t300" | "t400" | "t50"> = {
  kurumsal: "t300",
  goz: "t200",
  su: "t100",
  durus: "t400",
  nefes: "t300",
  beslenme: "t200",
};

/** Rotadan modülü bulur (ekran başlık tonu vb. için). */
export function featureForPath(pathname: string): Feature {
  if (pathname.startsWith("/eye")) return "goz";
  if (pathname.startsWith("/water")) return "su";
  if (pathname.startsWith("/posture")) return "durus";
  if (pathname.startsWith("/stress") || pathname.startsWith("/breathing")) return "nefes";
  if (
    pathname.startsWith("/nutrition") ||
    pathname.startsWith("/meal-entry") ||
    pathname.startsWith("/blood-test")
  ) {
    return "beslenme";
  }
  return "kurumsal";
}

export function useFeature(): Feature {
  return featureForPath(usePathname());
}

/** Eski çağrılarla uyum için geçiş bileşeni — artık alt ağaca aksan uygulamıyor. */
export function FeatureTint({
  children,
  ...rest
}: { feature?: Feature; children: ReactNode } & ViewProps) {
  return <View {...rest}>{children}</View>;
}
