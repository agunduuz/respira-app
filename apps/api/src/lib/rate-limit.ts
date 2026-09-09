import { HttpError } from "./http";

/**
 * Basit sabit pencereli sayaç.
 *
 * ⚠️ ÜRETİM UYARISI: Bu sayaç süreç belleğinde tutuluyor. Vercel gibi
 * sunucusuz ortamlarda her lambda örneğinin kendi belleği olduğu için
 * gerçek bir üst sınır GARANTİ ETMEZ — yalnızca kaba bir kötüye kullanım
 * frenidir. docs/02 "Rate limiting" maddesi Upstash Redis öneriyor;
 * yayına çıkmadan önce `consume` gövdesi @upstash/ratelimit ile
 * değiştirilmeli. Arayüz aynı kalacak şekilde tasarlandı.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitOptions {
  /** Pencere başına izin verilen istek sayısı. */
  limit: number;
  /** Pencere uzunluğu (ms). */
  windowMs: number;
}

export function consume(key: string, { limit, windowMs }: RateLimitOptions): void {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    throw new HttpError(429, `Çok fazla istek. ${retryAfter} saniye sonra tekrar dene.`, "RATE_LIMITED");
  }
}

/** Bellek sızıntısını önlemek için süresi dolmuş kovaları temizler. */
export function sweep(): void {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}
