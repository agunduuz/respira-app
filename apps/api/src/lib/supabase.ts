import { createClient } from "@supabase/supabase-js";

import { env } from "./env";

/**
 * Service role anahtarıyla oluşturulan istemci Row Level Security'yi BYPASS eder.
 * Sadece kullanıcı adına yapılmayan işlemler (webhook, temizlik görevi, admin)
 * için kullan. Normal istek akışında `requireUser` + Prisma yeterli.
 * docs/02-VERI-MODELI-VE-GUVENLIK.md → "Sırlar"
 */
export function createAdminClient() {
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
