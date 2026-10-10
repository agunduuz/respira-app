/**
 * OKLCH → sRGB dönüşümü. React Native CSS `oklch()` okumadığı için Lavanta Blok
 * tasarımındaki ton ölçeği (tek bir hue'dan türetilen açıklık/kroma basamakları)
 * burada JS tarafında sRGB'ye çevriliyor.
 *
 * Kaynak: Björn Ottosson, "A perceptual color space for image processing".
 * Gamut dışına çıkan renkler tarayıcıların yaptığı gibi kroma düşürülerek
 * (açıklık ve hue sabit) sRGB içine alınıyor — kırpma tonu kaydırırdı.
 */

export type Rgb = readonly [number, number, number];

const toLinear = (l: number, c: number, h: number): [number, number, number] => {
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const L = l_ ** 3;
  const M = m_ ** 3;
  const S = s_ ** 3;

  return [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ];
};

const EPS = 1e-6;
const inGamut = (rgb: readonly number[]) => rgb.every((v) => v >= -EPS && v <= 1 + EPS);

const encode = (v: number) => {
  const x = Math.min(1, Math.max(0, v));
  return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
};

/** `l` 0–1, `c` kroma, `h` derece. Sonuç 0–255 tam sayı kanallar. */
export function oklchToRgb(l: number, c: number, h: number): Rgb {
  let lin = toLinear(l, c, h);

  if (!inGamut(lin)) {
    let lo = 0;
    let hi = c;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(toLinear(l, mid, h))) lo = mid;
      else hi = mid;
    }
    lin = toLinear(l, lo, h);
  }

  return [
    Math.round(encode(lin[0]) * 255),
    Math.round(encode(lin[1]) * 255),
    Math.round(encode(lin[2]) * 255),
  ];
}

/** NativeWind'in `rgb(var(--x) / <alpha>)` biçimi için "r g b". */
export const toChannels = ([r, g, b]: Rgb) => `${r} ${g} ${b}`;

/** JS tarafı (SVG, Skia, navigasyon) için "rgb(r, g, b)". */
export const toCss = ([r, g, b]: Rgb) => `rgb(${r}, ${g}, ${b})`;
