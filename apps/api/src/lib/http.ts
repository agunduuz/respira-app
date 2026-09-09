import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";

import { UnauthorizedError } from "./auth";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/**
 * Route handler'ları saran ortak hata çevirici.
 *
 * Hassas alanlar (kan grubu, tahlil tarihi vb.) loglara yazılmamalı
 * (docs/02 → "Veri aktarımı"), bu yüzden burada istek gövdesi asla loglanmıyor;
 * yalnızca hata mesajı ve rota adı yazılıyor.
 */
export function handle<T>(fn: () => Promise<T>) {
  return fn().then(
    (data) => NextResponse.json(data),
    (error: unknown) => {
      if (error instanceof UnauthorizedError) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      if (error instanceof HttpError) {
        return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
      }
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: "Geçersiz istek gövdesi", issues: error.issues },
          { status: 400 }
        );
      }
      console.error("[api] beklenmeyen hata:", error instanceof Error ? error.message : error);
      return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
  );
}

/** Gövdeyi Zod ile doğrular — her endpoint'in ilk adımı (docs/02 "Girdi doğrulama"). */
export async function parseBody<S extends ZodType>(request: Request, schema: S): Promise<S["_output"]> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new HttpError(400, "Gövde geçerli JSON değil");
  }
  return schema.parse(raw);
}
