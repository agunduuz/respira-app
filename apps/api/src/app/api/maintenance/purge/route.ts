import { timingSafeEqual } from "node:crypto";

import { prisma } from "@respira/database";

import { HttpError, handle } from "@/lib/http";

export const dynamic = "force-dynamic";

/**
 * Sabit süreli karşılaştırma — düz `===` ile karakter karakter sızdırılabilen
 * zamanlama farkı, sırrın tahmin edilmesini kolaylaştırır.
 */
function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // timingSafeEqual farklı uzunlukta fırlatıyor; uzunluk zaten sır değil.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * docs/02 — saklama temizliği.
 *
 * Favoriye eklenmemiş öğünlerin ham içeriğini (serbest metin + besin kalemi
 * detayı) siler; sayısal metrikleri korur. Asıl mantık veritabanındaki
 * `purge_non_favorite_content()` fonksiyonunda — bu rota yalnızca tetikleyici.
 *
 * Kullanıcı oturumuyla değil, paylaşılan bir sırla korunuyor: bu iş tüm
 * kullanıcıların satırlarına dokunuyor, tek bir kullanıcının yetkisiyle
 * çalıştırılmamalı.
 *
 * Zamanlama: vercel.json içindeki cron girdisi günde bir çağırıyor. Vercel
 * dışında bir ortamda pg_cron ile doğrudan fonksiyonu çağırmak da mümkün:
 *   SELECT cron.schedule('respira-purge', '0 3 * * *',
 *     $$SELECT public.purge_non_favorite_content()$$);
 */
export function POST(request: Request) {
  return handle<{ purgedMeals: number; ranAt: string }>(async () => {
    const expected = process.env.CRON_SECRET;
    if (!expected) {
      throw new HttpError(503, "CRON_SECRET tanımlı değil", "NOT_CONFIGURED");
    }

    // Vercel Cron "Authorization: Bearer <CRON_SECRET>" gönderiyor.
    const header = request.headers.get("authorization") ?? "";
    const provided = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (!secretMatches(provided, expected)) {
      throw new HttpError(401, "Yetkisiz");
    }

    const rows = await prisma.$queryRaw<{ purged_meals: bigint }[]>`
      SELECT * FROM public.purge_non_favorite_content()
    `;

    return {
      purgedMeals: Number(rows[0]?.purged_meals ?? 0),
      ranAt: new Date().toISOString(),
    };
  });
}
