import type { WorkIntensity, WorkStyle } from "./posture-exercises.ts";

/**
 * Meslek/çalışma bilgisine göre gösterilen kısa ergonomi notları — docs/05.
 *
 * Kural: her not 1-2 cümle, pratik ve ekipman gerektirmeyen. Tanı koymaz,
 * tedavi önermez — bunlar genel ergonomi bilgisi, tıbbi tavsiye değil.
 */
export interface FyiMessage {
  id: string;
  text: string;
  /** Hangi çalışma şekilleri için uygun; boşsa herkese gösterilir. */
  workStyles?: WorkStyle[];
  /** Hangi iş yoğunlukları için uygun. */
  intensities?: WorkIntensity[];
  /** Yalnızca ekran başında çalışanlara. */
  requiresScreenWork?: boolean;
}

export const FYI_MESSAGES: readonly FyiMessage[] = [
  {
    id: "chair-height",
    text: "Sandalye yüksekliğini dizlerin 90 derece olacak şekilde ayarla.",
    workStyles: ["SEDENTARY", "MIXED"],
  },
  {
    id: "screen-eye-level",
    text: "Ekranın üst kenarı göz hizanda olmalı; boynunu öne eğmeden bakabilmelisin.",
    workStyles: ["SEDENTARY", "MIXED"],
    requiresScreenWork: true,
  },
  {
    id: "feet-flat",
    text: "Ayakların yere tam bassın. Ulaşmıyorsa küçük bir yükselti kullan.",
    workStyles: ["SEDENTARY", "MIXED"],
  },
  {
    id: "elbow-angle",
    text: "Dirseklerin gövdene yakın ve yaklaşık 90 derece olsun; klavyeye uzanmak omuzları yorar.",
    workStyles: ["SEDENTARY", "MIXED"],
    requiresScreenWork: true,
  },
  {
    id: "weight-shift",
    text: "Uzun süre aynı noktada durmak yerine ağırlığını periyodik olarak bir bacaktan diğerine aktar.",
    workStyles: ["STANDING_ACTIVE", "MIXED"],
  },
  {
    id: "supportive-shoes",
    text: "Gün boyu ayaktaysan, tabanı destekleyici ayakkabı yorgunluğu belirgin şekilde azaltabilir.",
    workStyles: ["STANDING_ACTIVE", "MIXED"],
  },
  {
    id: "lift-with-knees",
    text: "Kaldırma hareketlerinde belini değil dizlerini kullanmaya özen göster.",
    intensities: ["HEAVY"],
  },
  {
    id: "load-close",
    text: "Ağır bir yükü taşırken gövdene yakın tut; uzakta tutmak bel üzerindeki yükü katlar.",
    intensities: ["MODERATE", "HEAVY"],
  },
  {
    id: "microbreaks",
    text: "Uzun molalar yerine sık ve kısa molalar, kas yorgunluğunu daha etkili dağıtır.",
  },
  {
    id: "hydration-posture",
    text: "Su içmek için ayağa kalkmak, hem sıvı alımını hem hareketi bir arada çözer.",
  },
];

export interface FyiContext {
  workStyle: WorkStyle;
  workIntensity: WorkIntensity;
  hasScreenWork: boolean;
}

/** Kullanıcının profiline uyan notları süzer. */
export function eligibleFyi(ctx: FyiContext): FyiMessage[] {
  return FYI_MESSAGES.filter((m) => {
    if (m.workStyles && !m.workStyles.includes(ctx.workStyle)) return false;
    if (m.intensities && !m.intensities.includes(ctx.workIntensity)) return false;
    if (m.requiresScreenWork && !ctx.hasScreenWork) return false;
    return true;
  });
}

/**
 * Rotasyonlu seçim — docs/05 "dönüşümlü olarak kısa bilgi notları".
 *
 * Rastgele değil deterministik: aynı rotasyon sayısı aynı notu verir, böylece
 * test edilebilir ve arka arkaya aynı not tekrarlanmaz.
 */
export function rotateFyi(ctx: FyiContext, rotation: number): FyiMessage | null {
  const pool = eligibleFyi(ctx);
  if (pool.length === 0) return null;
  // Negatif rotasyonda da güvenli kalsın.
  const i = ((rotation % pool.length) + pool.length) % pool.length;
  return pool[i];
}
