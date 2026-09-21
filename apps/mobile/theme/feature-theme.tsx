import { usePathname } from "expo-router";
import { vars } from "nativewind";
import { createContext, useContext, type ReactNode } from "react";
import { View, type ViewProps } from "react-native";

import { useIsDark } from "./theme-store";
import { featureAccents, type Feature } from "./tokens";

export type { Feature };

const FeatureContext = createContext<Feature>("kurumsal");

/** İçinde bulunulan modül — palet bunu okuyup aksanı değiştiriyor. */
export function useFeature(): Feature {
  return useContext(FeatureContext);
}

/** Bir modülün aksan renkleri (kanal üçlüsü olarak). */
export function useAccentFor(feature: Feature) {
  const isDark = useIsDark();
  return featureAccents[feature][isDark ? "dark" : "light"];
}

/** Rotadan modülü bulur — her ekranda tek tek işaretlemek yerine tek yerde. */
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

/**
 * Aksanı alt ağaca uygular: hem className tarafına (CSS değişkeni) hem JS
 * tarafına (context → usePalette). Taban renklere dokunmaz.
 */
export function FeatureTint({
  feature,
  children,
  style,
  ...rest
}: { feature: Feature; children: ReactNode } & ViewProps) {
  const { accent, onAccent } = useAccentFor(feature);

  return (
    <FeatureContext.Provider value={feature}>
      <View style={[vars({ "--accent": accent, "--on-accent": onAccent }), style]} {...rest}>
        {children}
      </View>
    </FeatureContext.Provider>
  );
}

/** Aktif rotanın modülünü tüm ağaca uygular — ekranlar tek tek işaretlenmez. */
export function RouteFeatureTint({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <FeatureTint feature={featureForPath(pathname)} style={{ flex: 1 }}>
      {children}
    </FeatureTint>
  );
}
