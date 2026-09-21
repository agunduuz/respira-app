/**
 * Respira tasarım token'ları — tek doğruluk kaynağı.
 * Kaynak: docs/01-TASARIM-SISTEMI.md
 *
 * TASARIM YÖNÜ
 * Klişe wellness görünümünden (pastel yeşil/turkuaz, yuvarlak hatlar) bilinçli
 * olarak kaçınılıyor. Bunun yerine sıcak, neredeyse-siyah yeşilimsi bir taban:
 * ekran başında geçen uzun günün sonunda göz yormayan, mavi ışığı düşük bir
 * zemin. Aksan mint (#7CE0B8) tek "canlı" nokta — cesaret tek yerde harcanıyor.
 *
 * Renkler burada RGB kanal üçlüsü olarak duruyor ("15 23 18") çünkü NativeWind
 * bunları CSS değişkeni olarak alıp `rgb(var(--x) / <alpha-value>)` ile opaklık
 * uygulayabiliyor. Hex karşılıkları yorumda.
 */

/** Koyu tema — VARSAYILAN. */
export const darkPalette = {
  bg: "15 23 18", // #0F1712  sıcak, neredeyse-siyah yeşil
  surface: "26 38 32", // #1A2620  kart/panel
  elevated: "34 50 42", // #22322A  modal, yükseltilmiş yüzey
  border: "44 61 52", // #2C3D34  dekoratif ayraç
  borderStrong: "90 104 95", // #5A685F  interaktif sınır — 3.11:1 (WCAG 1.4.11)
  text: "243 246 244", // #F3F6F4  16.76:1
  textMuted: "157 176 164", // #9DB0A4   7.97:1
  accent: "124 224 184", // #7CE0B8  ana aksiyon — "nefes al"
  onAccent: "5 35 26", // #05231A
  warm: "232 161 92", // #E8A15C  streak/uyarı
  onWarm: "36 21 5", // #241505
  danger: "255 138 138", // #FF8A8A
  onDanger: "42 8 8", // #2A0808
} as const;

/**
 * Açık tema — aynı ton ailesinden türetildi (ters kontrast, yeşilimsi nötrler).
 * Mint aksan açık zeminde 4.5:1'i tutturamadığı için koyulaştırıldı (#0B6B49).
 */
export const lightPalette = {
  bg: "242 246 241", // #F2F6F1
  surface: "255 255 255", // #FFFFFF
  elevated: "255 255 255", // #FFFFFF
  border: "220 229 219", // #DCE5DB
  borderStrong: "121 139 127", // #798B7F  3.31:1
  text: "15 23 18", // #0F1712  16.70:1
  textMuted: "79 97 87", // #4F6157   6.05:1
  accent: "11 107 73", // #0B6B49   5.98:1
  onAccent: "255 255 255", // #FFFFFF
  warm: "138 75 18", // #8A4B12   6.21:1
  onWarm: "255 255 255", // #FFFFFF
  danger: "164 35 28", // #A4231C   6.78:1
  onDanger: "255 255 255", // #FFFFFF
} as const;

export type PaletteKey = keyof typeof darkPalette;

/**
 * Özellik başına aksan (UI-004). Taban renkler (zemin, yüzey, metin) her yerde
 * AYNI kalır — yalnızca aksan değişir. Böylece her modülün kendi kimliği olur
 * ama uygulama dağınık bir pastel koleksiyonuna dönüşmez.
 *
 * Hepsi WCAG AA: açık temada beyaz kart üstünde en düşük 5.36:1, koyu temada
 * yüzey üstünde en düşük 8.02:1.
 */
export type Feature = "kurumsal" | "goz" | "beslenme" | "su" | "durus" | "nefes";

export const featureAccents: Record<Feature, { light: Accent; dark: Accent }> = {
  /** Anasayfa, Bugün, Ayarlar — markanın mint yeşili. */
  kurumsal: {
    light: { accent: "11 107 73", onAccent: "255 255 255" }, // #0B6B49
    dark: { accent: "124 224 184", onAccent: "5 35 26" }, // #7CE0B8
  },
  /** Göz — kahve/ela tonları: ekran ışığının karşısında sıcak ve yumuşak. */
  goz: {
    light: { accent: "122 74 33", onAccent: "255 255 255" }, // #7A4A21
    dark: { accent: "221 184 146", onAccent: "42 26 12" }, // #DDB892
  },
  /** Beslenme — kavrulmuş amber. */
  beslenme: {
    light: { accent: "138 91 18", onAccent: "255 255 255" }, // #8A5B12
    dark: { accent: "232 192 122", onAccent: "36 23 5" }, // #E8C07A
  },
  /** Su — mavi. */
  su: {
    light: { accent: "18 96 143", onAccent: "255 255 255" }, // #12608F
    dark: { accent: "134 199 236", onAccent: "4 32 47" }, // #86C7EC
  },
  /** Duruş — kil/terrakota: harekete çağıran toprak tonu. */
  durus: {
    light: { accent: "156 66 33", onAccent: "255 255 255" }, // #9C4221
    dark: { accent: "240 169 140", onAccent: "46 16 4" }, // #F0A98C
  },
  /** Nefes — sakin indigo; diğerlerinden daha serin ve sofistike. */
  nefes: {
    light: { accent: "76 79 159", onAccent: "255 255 255" }, // #4C4F9F
    dark: { accent: "185 189 242", onAccent: "20 21 58" }, // #B9BDF2
  },
};

interface Accent {
  accent: string;
  onAccent: string;
}

/** 4/8pt ritmi — pro-rules "8dp spacing rhythm". */
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
 * için 48 alıyoruz (pro-rules "Touch Target Minimum").
 */
export const touchTarget = {
  min: 48,
  /** Görsel öğe daha küçükse Pressable'a verilecek hitSlop payı. */
  slop: 10,
} as const;

/** Organik/biyomimetik yön: köşeler yumuşak ama yuvarlak-şirin değil. */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fontFamily = {
  /** Sayaçlar ve büyük rakamlar — en sık bakılan öğeler. */
  display: "Fraunces_600SemiBold",
  displayBold: "Fraunces_700Bold",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemiBold: "Inter_600SemiBold",
  /** Grafik/tablo rakamları hizalı dursun diye tabular mono. */
  data: "IBMPlexMono_500Medium",
} as const;

/**
 * Tipografi ölçeği. Gövde 16pt tabanlı, satır yüksekliği 1.5 (pro-rules §6).
 * Boyutlar Dynamic Type ile ölçekleneceği için `allowFontScaling` kapatılmıyor.
 */
export const typeScale = {
  displayXl: { fontSize: 48, lineHeight: 52 },
  displayLg: { fontSize: 34, lineHeight: 40 },
  title: { fontSize: 22, lineHeight: 28 },
  body: { fontSize: 16, lineHeight: 24 },
  bodySm: { fontSize: 14, lineHeight: 21 },
  /** Form etiketleri ve seçim çipleri — Apple HIG "subheadline" karşılığı. */
  subhead: { fontSize: 15, lineHeight: 20 },
  /** Buton metni — gövde boyutunda, kalınlıkla ayrışır (HIG). */
  button: { fontSize: 16, lineHeight: 22 },
  label: { fontSize: 13, lineHeight: 18 },
  data: { fontSize: 15, lineHeight: 20 },
} as const;

/**
 * Motion. pro-rules: "tek süreyi her geçişe kopyalama" — süre mesafeye ve
 * karmaşıklığa göre seçilir. Hareket azaltma açıkken bunlar 0'a düşer.
 */
export const motion = {
  /** Basma geri bildirimi — 80-150ms aralığında olmalı. */
  press: 120,
  /** Küçük durum değişimi (renk, opaklık). */
  micro: 180,
  /** Kart açılma, sayfa içi geçiş. */
  standard: 280,
  /** Skia imza animasyonları (nefes döngüsü, su dolumu). */
  expressive: 600,
} as const;

/** Basma geri bildirimi: layout sınırlarını kaydırmadan (pro-rules). */
export const pressedOpacity = 0.65;
