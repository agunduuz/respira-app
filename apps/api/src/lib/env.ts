// Backend ortam değişkenleri. Bu dosya asla mobil tarafa import edilmez.
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Eksik ortam değişkeni: ${name}. apps/api/.env dosyasını kontrol et.`);
  }
  return value;
}

export const env = {
  get databaseUrl() {
    return required("DATABASE_URL");
  },
  get supabaseUrl() {
    return required("SUPABASE_URL");
  },
  get supabaseAnonKey() {
    return required("SUPABASE_ANON_KEY");
  },
  /** ⚠️ RLS'i bypass eder — yalnızca sunucuda, yalnızca gerektiğinde kullan. */
  get supabaseServiceRoleKey() {
    return required("SUPABASE_SERVICE_ROLE_KEY");
  },
};
