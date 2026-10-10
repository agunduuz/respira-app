/**
 * Lavanta Blok ton ölçeği — tek bir hue'dan (0–360°) türeyen 15 renk.
 * Kaynak: "Respira B - Lavanta Blok" tasarımı (TONES / pal()). Açıklık (L) ve
 * kroma (C) basamakları tasarımdakiyle birebir aynı; yalnızca hue değişiyor.
 *
 *   t25–t100   zeminler ve sakin yüzeyler
 *   t200–t400  modül blokları (her modül kendi tonunda bir blok alır)
 *   t500–t900  vurgu, koyu yüzeyler ve metin
 *   mut/mutL   ikincil metin (açık zeminde / koyu zeminde)
 *   line/line2 ince ayraçlar
 */
import { oklchToRgb, toChannels, toCss } from "../lib/oklch.ts";

export const DEFAULT_HUE = 290;

/** [ad, açıklık, kroma] — tasarımdaki TONES listesi. */
export const TONES = [
  ["t25", 0.975, 0.012],
  ["t50", 0.95, 0.03],
  ["t100", 0.91, 0.06],
  ["t200", 0.85, 0.1],
  ["t300", 0.77, 0.14],
  ["t400", 0.68, 0.16],
  ["t500", 0.58, 0.18],
  ["t600", 0.48, 0.17],
  ["t700", 0.38, 0.13],
  ["t800", 0.28, 0.09],
  ["t900", 0.19, 0.04],
  ["mut", 0.47, 0.035],
  ["mutL", 0.83, 0.03],
  ["line", 0.89, 0.02],
  ["line2", 0.78, 0.03],
] as const;

export type ToneName = (typeof TONES)[number][0];

/** Profil > Tema rengi'ndeki hazır renkler — tasarımdaki HUES. */
export const HUE_PRESETS = [
  { name: "Mor", hue: 290 },
  { name: "İndigo", hue: 265 },
  { name: "Mavi", hue: 240 },
  { name: "Turkuaz", hue: 200 },
  { name: "Yeşil", hue: 150 },
  { name: "Kehribar", hue: 70 },
  { name: "Mercan", hue: 30 },
  { name: "Pembe", hue: 350 },
] as const;

/** Hazır renklere ±4° yakınsa adını, değilse "Özel · 123°" döner. */
export function hueName(hue: number): string {
  const near = HUE_PRESETS.find((p) => Math.abs(p.hue - hue) <= 4);
  return near ? near.name : `Özel · ${Math.round(hue)}°`;
}

/** Tasarımdaki rozet/halka rengi örnekleri: oklch(.62 .17 hue). */
export function swatchColor(hue: number): string {
  return toCss(oklchToRgb(0.62, 0.17, hue));
}

/** Renk seçici çubuğunun gradyanı: oklch(.68 .16 h) — 0..360 arası 9 durak. */
export const HUE_GRADIENT_STOPS = Array.from({ length: 9 }, (_, i) =>
  toCss(oklchToRgb(0.68, 0.16, i * 45))
);

export type Tones = Record<ToneName, string>;

/** Bir hue için tüm tonlar, "r g b" kanal üçlüsü olarak. */
export function toneChannels(hue: number): Tones {
  const out = {} as Tones;
  for (const [name, l, c] of TONES) out[name] = toChannels(oklchToRgb(l, c, hue));
  return out;
}

const WHITE = "255 255 255";
/** Tehlike rengi hue'dan bağımsız: silme/hata her temada kırmızı kalmalı. */
const DANGER = "164 35 28";

/**
 * Hue → NativeWind CSS değişkenleri. Eski semantik token'lar (bg, surface,
 * text, accent…) tonlara eşlenir; böylece henüz yeni tasarıma taşınmamış
 * ekranlar da kullanıcının seçtiği renge boyanır.
 */
export function themeVars(hue: number): Record<string, string> {
  const t = toneChannels(hue);
  return {
    "--t25": t.t25,
    "--t50": t.t50,
    "--t100": t.t100,
    "--t200": t.t200,
    "--t300": t.t300,
    "--t400": t.t400,
    "--t500": t.t500,
    "--t600": t.t600,
    "--t700": t.t700,
    "--t800": t.t800,
    "--t900": t.t900,
    "--mut": t.mut,
    "--mut-l": t.mutL,
    "--line": t.line,
    "--line-2": t.line2,
    // Semantik eşlemeler
    "--bg": t.t25,
    "--surface": WHITE,
    "--elevated": t.t50,
    "--border": t.line,
    "--border-strong": t.line2,
    "--text": t.t900,
    "--text-muted": t.mut,
    "--accent": t.t900,
    "--on-accent": WHITE,
    "--warm": t.t500,
    "--on-warm": WHITE,
    "--danger": DANGER,
    "--on-danger": WHITE,
  };
}

/** className almayan yerler (ikon, SVG, Skia, navigasyon) için JS paleti. */
export interface Palette extends Record<ToneName, string> {
  bg: string;
  surface: string;
  elevated: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  accent: string;
  onAccent: string;
  warm: string;
  onWarm: string;
  danger: string;
  onDanger: string;
  white: string;
}

export function paletteFor(hue: number): Palette {
  const t = toneChannels(hue);
  return {
    ...t,
    bg: t.t25,
    surface: WHITE,
    elevated: t.t50,
    border: t.line,
    borderStrong: t.line2,
    text: t.t900,
    textMuted: t.mut,
    accent: t.t900,
    onAccent: WHITE,
    warm: t.t500,
    onWarm: WHITE,
    danger: DANGER,
    onDanger: WHITE,
    white: WHITE,
  };
}
