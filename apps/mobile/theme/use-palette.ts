import { useFeature } from "./feature-theme";
import { useIsDark } from "./theme-store";
import { darkPalette, featureAccents, lightPalette } from "./tokens";

export type Palette = { [K in keyof typeof darkPalette]: string };

/** "11 107 73" → "rgb(11, 107, 73)" — SVG/Skia/navigation gibi className almayan yerler için. */
export const rgb = (channels: string) => `rgb(${channels.split(" ").join(", ")})`;

/**
 * Etkin temanın paleti. className alamayan yerler (ikon rengi, Skia, tab bar)
 * rengi buradan okur; tema seçimi tek noktada kalır.
 */
export function usePalette(): Palette {
  const feature = useFeature();
  const isLight = !useIsDark();
  const base = isLight ? lightPalette : darkPalette;
  const accent = featureAccents[feature][isLight ? "light" : "dark"];

  // Taban renkler her modülde aynı; yalnızca aksan değişiyor (UI-004).
  return { ...base, accent: accent.accent, onAccent: accent.onAccent };
}
