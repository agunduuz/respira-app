import { createClient } from "@supabase/supabase-js";

import { env } from "./env";

export class UnauthorizedError extends Error {
  constructor(message = "Yetkisiz istek") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export interface AuthedUser {
  /** Supabase auth.users.id — Prisma User.authId ile eşleşir. */
  authId: string;
  email: string | null;
}

/**
 * Authorization: Bearer <access_token> header'ını doğrular.
 * Her korumalı route'un ilk satırı bu olmalı — RLS'e ek olarak backend'de de
 * kimlik kontrolü yapıyoruz (defense in depth, docs/02).
 */
export async function requireUser(request: Request): Promise<AuthedUser> {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    throw new UnauthorizedError("Authorization header eksik");
  }

  const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new UnauthorizedError("Geçersiz veya süresi dolmuş token");
  }

  return { authId: data.user.id, email: data.user.email ?? null };
}
