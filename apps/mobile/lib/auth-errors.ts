/**
 * Supabase GoTrue hata mesajları İngilizce ve teknik geliyor
 * ("Token has expired or is invalid" gibi). Kullanıcıya ne yapması
 * gerektiğini söyleyen, Türkçe ve eyleme dönük mesajlere çeviriyoruz.
 *
 * Eşleşme mesaj metnine göre — Supabase JS istemcisi kararlı bir hata kodu
 * alanı her sürümde garanti etmiyor, ama mesaj metinleri stabil.
 */
export function translateAuthError(message: string | null | undefined): string {
  if (!message) return "Bir şeyler ters gitti. Lütfen tekrar dene.";

  const m = message.toLowerCase();

  if (m.includes("token has expired") || m.includes("otp_expired")) {
    return "Kodun süresi dolmuş ya da geçersiz. \"E-postayı değiştir\"e dokunup yeni bir kod iste.";
  }

  if (m.includes("invalid login credentials")) {
    return "E-posta veya şifre hatalı.";
  }

  if (m.includes("user already registered") || m.includes("already registered")) {
    return "Bu e-posta adresiyle zaten bir hesap var. \"Giriş Yap\" sekmesini kullan.";
  }

  if (m.includes("password should be at least") || m.includes("password should contain")) {
    return "Şifre yeterince güçlü değil — en az 6 karakter kullan.";
  }

  if (m.includes("email not confirmed")) {
    return "E-posta adresin henüz doğrulanmamış. Gelen kutunu kontrol et.";
  }

  if (m.includes("for security purposes") && m.includes("after")) {
    const seconds = message.match(/(\d+)\s*seconds?/)?.[1];
    return seconds
      ? `Güvenlik nedeniyle ${seconds} saniye sonra tekrar kod isteyebilirsin.`
      : "Güvenlik nedeniyle bir süre bekleyip tekrar dene.";
  }

  if (m.includes("rate limit") || m.includes("too many requests")) {
    return "Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar dene.";
  }

  if (
    m.includes("signups not allowed") ||
    m.includes("signup is disabled") ||
    m.includes("signups are disabled") ||
    m.includes("email_provider_disabled")
  ) {
    return "Bu e-posta ile yeni kayıt şu anda kapalı. Lütfen daha sonra tekrar dene.";
  }

  if (m.includes("invalid email") || m.includes("unable to validate email")) {
    return "E-posta adresi geçerli görünmüyor. Kontrol edip tekrar dene.";
  }

  if (m.includes("network") || m.includes("fetch")) {
    return "İnternet bağlantısı kurulamadı. Bağlantını kontrol edip tekrar dene.";
  }

  return "Bir şeyler ters gitti. Lütfen tekrar dene.";
}
