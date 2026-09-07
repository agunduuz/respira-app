// EXPO_PUBLIC_* önekli değişkenler build sırasında pakete gömülür — bu yüzden
// buraya SADECE herkese açık olabilecek değerler girer.
// SUPABASE_SERVICE_ROLE_KEY gibi yüksek yetkili anahtarlar asla mobile'a girmez.
// Detay: docs/02-VERI-MODELI-VE-GUVENLIK.md

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Eksik ortam değişkeni: ${name}. apps/mobile/.env dosyasını .env.example'a göre doldur.`
    );
  }
  return value;
}

export const env = {
  apiUrl: required("EXPO_PUBLIC_API_URL", process.env.EXPO_PUBLIC_API_URL),
  supabaseUrl: required("EXPO_PUBLIC_SUPABASE_URL", process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: required(
    "EXPO_PUBLIC_SUPABASE_ANON_KEY",
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  ),
};
