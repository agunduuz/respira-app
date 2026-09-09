import { NextResponse, type NextRequest } from "next/server";

/**
 * CORS — yalnızca açıkça izin verilen origin'ler.
 *
 * Mobil uygulamanın (iOS/Android) isteklerinde Origin header'ı yoktur ve
 * tarayıcı CORS'u uygulanmaz; bu katman sadece Expo web çıktısı ve olası bir
 * web istemcisi içindir. Varsayılan liste yalnızca yerel geliştirme
 * adresleridir — üretimde CORS_ALLOWED_ORIGINS ile açıkça tanımlanmalı.
 *
 * Joker (*) bilinçli olarak kullanılmıyor: Authorization header'ı taşıyan
 * isteklerde her origin'e açık bir API, token'ı ele geçiren herhangi bir
 * sitenin kullanıcı adına istek atabilmesi demek.
 */
const DEV_ORIGINS = ["http://localhost:8081", "http://localhost:8082", "http://localhost:19006"];

function allowedOrigins(): string[] {
  const configured = process.env.CORS_ALLOWED_ORIGINS?.split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  if (configured?.length) return configured;
  return process.env.NODE_ENV === "development" ? DEV_ORIGINS : [];
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    // Origin'e gore farkli cevap veriyoruz — ara katmanlar karistirmasin.
    Vary: "Origin",
  };
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");

  // Origin yok = mobil uygulama ya da sunucu-sunucu istegi. Dokunma.
  if (!origin) return NextResponse.next();

  if (!allowedOrigins().includes(origin)) {
    // Izinsiz origin: preflight reddedilir, normal istek CORS basligi olmadan
    // gecer (tarayici cevabi zaten okuyamaz).
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 403 });
    }
    return NextResponse.next();
  }

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
  }

  const response = NextResponse.next();
  for (const [k, v] of Object.entries(corsHeaders(origin))) {
    response.headers.set(k, v);
  }
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
