import { BREATHING_TECHNIQUES, STRESS_ALTERNATIVE_SUGGESTIONS } from "@respira/shared-types";

import { EYE_TIPS, WATER_TIPS } from "./tips";

export interface DiscoverItem {
  id: string;
  /** Kartın üstündeki küçük kategori etiketi. */
  kicker: string;
  title: string;
  body: string;
  /** Karta dokununca açılan ekran. */
  href: "/eye" | "/water" | "/posture" | "/stress" | "/nutrition";
}

/**
 * Anasayfadaki keşif kartları. İçerik uygulamanın kendi bilgisinden geliyor
 * (nefes teknikleri, ipuçları) — kullanıcıyı bir eyleme zorlamadan "bakmaya
 * değer" bir alan bırakıyor. Sağlık iddiası içermez.
 */
export const DISCOVER_ITEMS: readonly DiscoverItem[] = [
  {
    id: "eye-20-20-20",
    kicker: "Göz",
    title: "20-20-20 nedir?",
    body: EYE_TIPS[0],
    href: "/eye",
  },
  {
    id: "breath-box",
    kicker: "Nefes",
    title: BREATHING_TECHNIQUES.BOX.label,
    body: BREATHING_TECHNIQUES.BOX.instruction,
    href: "/stress",
  },
  {
    id: "breath-478",
    kicker: "Nefes",
    title: BREATHING_TECHNIQUES.FOUR_SEVEN_EIGHT.label,
    body: BREATHING_TECHNIQUES.FOUR_SEVEN_EIGHT.whenToUse,
    href: "/stress",
  },
  {
    id: "water-habit",
    kicker: "Su",
    title: "Alışkanlık kurmanın kolay yolu",
    body: WATER_TIPS[1],
    href: "/water",
  },
  {
    id: "posture-walk",
    kicker: "Duruş",
    title: STRESS_ALTERNATIVE_SUGGESTIONS[0].title,
    body: STRESS_ALTERNATIVE_SUGGESTIONS[0].description,
    href: "/posture",
  },
  {
    id: "posture-stretch",
    kicker: "Duruş",
    title: STRESS_ALTERNATIVE_SUGGESTIONS[1].title,
    body: STRESS_ALTERNATIVE_SUGGESTIONS[1].description,
    href: "/posture",
  },
];

const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
const WEEKDAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

/** "20 Eylül, Cumartesi" — Intl'e güvenmeden, cihaz diline bakmaksızın Türkçe. */
export function formatToday(date = new Date()): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]}, ${WEEKDAYS[date.getDay()]}`;
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 5) return "İyi geceler";
  if (h < 12) return "Günaydın";
  if (h < 18) return "İyi günler";
  return "İyi akşamlar";
}
