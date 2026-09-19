import { supabase } from "./supabase";
import { env } from "./env";

export interface ApiIssue {
  path: (string | number)[];
  message: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly issues?: ApiIssue[]
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Next.js API'ye kimlik doğrulamalı istek atar.
 * Supabase access token'ı Authorization header'ına eklenir; backend her istekte
 * bunu doğrulayıp userId'yi kendisi çıkarır (docs/02 → "defense in depth").
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const raw = await response.text();
    // Backend hataları {error, code?, issues?} JSON'u döner (bkz. apps/api/src/lib/http.ts
    // `handle`). Bunu ham metin olarak göstermek kullanıcıya sistem çökmüş gibi görünüyordu —
    // burada tek yerde ayrıştırıp sadece anlamlı mesajı fırlatıyoruz.
    let message = raw || response.statusText;
    let code: string | undefined;
    let issues: ApiIssue[] | undefined;
    try {
      const parsed = JSON.parse(raw) as { error?: string; code?: string; issues?: ApiIssue[] };
      if (parsed && typeof parsed.error === "string") {
        message = parsed.error;
        code = parsed.code;
        issues = parsed.issues;
      }
    } catch {
      // JSON değilse ham metni/status metnini kullan.
    }
    throw new ApiError(message, response.status, code, issues);
  }

  return response.json() as Promise<T>;
}
