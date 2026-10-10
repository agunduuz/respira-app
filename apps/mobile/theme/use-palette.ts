import { useMemo } from "react";

import { useHueStore } from "./hue-store";
import { paletteFor, type Palette } from "./tones";

export type { Palette };

/** "11 107 73" → "rgb(11, 107, 73)" — SVG/Skia/navigation gibi className almayan yerler için. */
export const rgb = (channels: string) => `rgb(${channels.split(" ").join(", ")})`;

/** "11 107 73" + opaklık → "rgba(11, 107, 73, 0.5)" */
export const rgba = (channels: string, alpha: number) =>
  `rgba(${channels.split(" ").join(", ")}, ${alpha})`;

/**
 * Seçili ana renge göre palet. className alamayan yerler (ikon rengi, SVG,
 * Skia, tab bar) rengi buradan okur; hue değişince hepsi birlikte yenilenir.
 */
export function usePalette(): Palette {
  const hue = useHueStore((s) => s.hue);
  return useMemo(() => paletteFor(hue), [hue]);
}
