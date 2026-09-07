import { supabase } from "./supabase";
import { env } from "./env";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
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
    const body = await response.text();
    throw new ApiError(body || response.statusText, response.status);
  }

  return response.json() as Promise<T>;
}
