/**
 * Respira tasarım token'ları — tek doğruluk kaynağı.
 * Kaynak: "Respira B - Lavanta Blok" tasarımı, docs/01-TASARIM-SISTEMI.md
 *
 * RENKLER burada DEĞİL: Lavanta Blok'ta tek bir ana renk (hue) var ve kullanıcı
 * onu Profil'den değiştirebiliyor. Bu yüzden renkler çalışma zamanında hue'dan
 * üretiliyor → theme/tones.ts. Burada yalnızca renkten bağımsız ölçüler duruyor.
 */

/** 4/8pt ritmi. */
export const spacing = {
  0.5: 2,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

/**
 * Dokunma hedefi tabanı. iOS 44pt, Android 48dp — ikisini birden karşılamak
 * için 48 alıyoruz. Tasarımdaki ikon düğmeleri 46px; hitSlop ile 48'e tamamlanır.
 */
export const touchTarget = {
  min: 48,
  /** Görsel öğe daha küçükse Pressable'a verilecek hitSlop payı. */
  slop: 10,
} as const;

/**
 * Lavanta Blok köşe dili: bloklar 28–30, küçük kartlar 22–26, etiketler 11–14,
 * düğmeler ve çubuklar tam kapsül.
 */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  /** Küçük kart / ızgara karosu */
  tile: 22,
  card: 26,
  /** Büyük blok */
  block: 28,
  blockLg: 30,
  /** Sayfa başlık bloğunun alt köşeleri */
  sheet: 40,
  /** Gezinme kapsülü */
  capsule: 37,
  full: 9999,
} as const;

/**
 * Urbanist tek aile — ağırlık ve boyutla hiyerarşi. Tasarımdaki 500–900
 * ağırlıkları: gövde 500, vurgu 600/700, başlık 800, büyük rakam 900.
 * (İsimler eski bileşenlerle uyumlu kalsın diye korundu.)
 */
export const fontFamily = {
  regular: "Urbanist_400Regular",
  body: "Urbanist_500Medium",
  bodyMedium: "Urbanist_600SemiBold",
  bodySemiBold: "Urbanist_700Bold",
  heavy: "Urbanist_800ExtraBold",
  black: "Urbanist_900Black",
  /** Eski adlar: başlık / büyük rakam / veri */
  display: "Urbanist_800ExtraBold",
  displayBold: "Urbanist_900Black",
  data: "Urbanist_700Bold",
  /** Material Symbols Rounded — ikonlar ligatür ile yazılır ("home"). */
  icon: "MaterialSymbolsRounded_400Regular",
} as const;

/**
 * Tipografi ölçeği (tasarımdaki boyutlar). Dynamic Type için allowFontScaling
 * kapatılmıyor.
 */
export const typeScale = {
  /** Sayaç / dev rakam (göz 80, su 50, saat 44) */
  numHero: { fontSize: 54, lineHeight: 68 },
  displayXl: { fontSize: 48, lineHeight: 60 },
  displayLg: { fontSize: 34, lineHeight: 44 },
  /** Ekran başlığı (Lavanta Blok: 30–36) */
  headline: { fontSize: 30, lineHeight: 38 },
  title: { fontSize: 22, lineHeight: 28 },
  /** Bölüm başlığı (24) */
  section: { fontSize: 24, lineHeight: 30 },
  body: { fontSize: 16, lineHeight: 24 },
  bodySm: { fontSize: 14, lineHeight: 20 },
  subhead: { fontSize: 15, lineHeight: 20 },
  button: { fontSize: 17, lineHeight: 22 },
  label: { fontSize: 13, lineHeight: 18 },
  /** Hap etiket / küçük not */
  caption: { fontSize: 12, lineHeight: 16 },
  data: { fontSize: 15, lineHeight: 20 },
} as const;

/** Motion — süre mesafeye ve karmaşıklığa göre. Hareket azaltma açıkken 0'a düşer. */
export const motion = {
  /** Basma geri bildirimi (tasarımda scale .9–.97). */
  press: 120,
  /** Küçük durum değişimi (renk, toggle .2s). */
  micro: 200,
  /** Halka / çubuk dolumu (.4–.6s). */
  standard: 500,
  /** Su dalgası, nefes orb'u. */
  expressive: 1200,
} as const;

/** Basma geri bildirimi: layout sınırlarını kaydırmadan. */
export const pressedOpacity = 0.65;
/** Tasarımdaki `style-active: transform:scale(.97)` */
export const pressedScale = 0.97;
