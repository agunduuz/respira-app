# 02 — Veri Modeli ve Güvenlik

Bu dosya, diğer tüm özellik dosyalarının üzerine inşa edildiği temeldir. Önce bu okunmalı ve uygulanmalı.

## Neden Bu Dosya Önce Gelmeli?

5 özelliğin (göz, kan şekeri, postür, su, stres) hepsi aynı kullanıcıya, aynı günlük rapor mantığına ve aynı bildirim/izin sistemine bağlanıyor. Ortak modeli (`User`, `DailyLog`, `ConsentRecord`) baştan doğru kurmazsak, her özellik kendi izole veri adasını oluşturur ve "günlük özet" gibi çapraz-özellik raporlar imkansız hale gelir.

## Prisma Şeması (Çekirdek)

```prisma
// packages/database/schema.prisma

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ---------- ÇEKİRDEK ----------

model User {
  id            String   @id @default(uuid())
  authId        String   @unique // Supabase auth.users.id ile eşleşir
  email         String?  @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  consents          ConsentRecord[]
  notificationPrefs NotificationPreference[]

  eyeStrainSettings EyeStrainSettings?
  eyeStrainSessions EyeStrainSession[]

  nutritionProfile  NutritionProfile?
  mealEntries       MealEntry[]
  dailyNutrition    DailyNutritionSummary[]

  postureProfile    PostureProfile?
  postureBreakLogs  PostureBreakLog[]

  waterGoal         WaterGoal?
  waterLogs         WaterIntakeLog[]

  stressProfile     StressProfile?
  breathingSessions BreathingSession[]

  dailyReports      DailyReport[]
}

// KVKK: her açık rıza kaydı ayrı bir satır — hangi metne, ne zaman, hangi
// sürüme onay verildiği kanıtlanabilir olmalı (KVKK md. 6, açık rıza ispatı)
model ConsentRecord {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  consentType   ConsentType
  textVersion   String   // örn. "aydinlatma-v1.2"
  grantedAt     DateTime @default(now())
  revokedAt     DateTime?
}

enum ConsentType {
  AYDINLATMA_METNI          // genel KVKK aydınlatma
  OZEL_NITELIKLI_VERI_RIZASI // sağlık verisi işleme açık rızası
  BILDIRIM_IZNI_GOZ
  BILDIRIM_IZNI_OGUN
  BILDIRIM_IZNI_KAN_TAHLILI
  BILDIRIM_IZNI_POSTUR
  BILDIRIM_IZNI_SU
  BILDIRIM_IZNI_STRES
}

model NotificationPreference {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  category    String   // "eye_strain" | "water" | "posture" | "stress" | "blood_test"
  enabled     Boolean  @default(false)
  frequencyMinutes Int?
  quietHoursStart  String? // "22:00"
  quietHoursEnd    String? // "08:00"
  updatedAt   DateTime @updatedAt
}

// Tüm özelliklerin günlük özetini tek yerde toplayan çapraz-özellik tablo
model DailyReport {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  date        DateTime @db.Date
  isFavorite  Boolean  @default(false)

  // isFavorite=false ise, ilgili günün ham içerik detayları (öğün metinleri vb.)
  // periyodik bir temizlik işiyle silinir; sadece bu tablodaki özet metrikler kalır.
  eyeStrainComplianceRate  Float?
  totalWaterMl             Int?
  totalCalories             Int?
  totalProteinG              Float?
  totalCarbsG                 Float?
  totalFatG                    Float?
  postureBreaksTaken          Int?
  stressSessionsCompleted     Int?

  createdAt   DateTime @default(now())

  @@unique([userId, date])
}
```

> Her özelliğin kendi modelleri (`EyeStrainSettings`, `NutritionProfile`, `MealEntry`, vb.) ilgili özellik dosyasında (`03-...` — `07-...`) tanımlıdır. Bu dosyadaki `User` modeli o alanlara referans veriyor — Prisma şemasını birleştirirken hepsini aynı `schema.prisma` içine ekle.

## Favori Gün/Öğün Mantığı — Veri Saklama Kuralı

Kullanıcının isteği: favoriye eklenmeyen gün/öğünlerin *ham içeriği* silinsin, sadece *metrikleri* kalsın.

**Uygulama mantığı:**
- Her `MealEntry` ve `DailyReport` bir `isFavorite` alanına sahip.
- Arka planda çalışan bir temizlik görevi (ör. Supabase Edge Function + `pg_cron`, günde bir kez):
  ```sql
  -- 30 günden eski, favori olmayan kayıtların ham metin/detay alanlarını temizle
  UPDATE meal_entries
  SET raw_text = NULL, food_items_detail = NULL
  WHERE is_favorite = false
    AND created_at < NOW() - INTERVAL '30 days';
  ```
- Silinen alanlar: serbest metin girişleri, öğün fotoğrafı varsa dosya.
- Korunan alanlar: kalori/protein/karb/yağ/lif sayısal değerleri (grafikler bunlara dayanıyor).
- Kullanıcıya ayarlardan bu süreyi (30 gün) değiştirme seçeneği sunulabilir ama varsayılan makul bir süre olmalı.

## KVKK Uyumluluğu — Zorunlu Gereksinimler

Sağlık verisi (beslenme, kan şekeri durumu, kan grubu, stres seviyesi) KVKK madde 6 kapsamında **özel nitelikli kişisel veri**dir. Bu, standart bir "kabul ediyorum" checkbox'ından daha fazlasını gerektirir.

**Uygulanması gerekenler:**

1. **Aydınlatma Metni** — Onboarding'in ilk ekranında, veri toplanmadan önce gösterilmeli. Hangi veri, ne amaçla, ne kadar süre, kiminle paylaşılıp paylaşılmayacağı (V1'de kimseyle paylaşılmıyor) açıkça yazılmalı.
2. **Açık Rıza** — Aydınlatmadan ayrı, aktif bir onay adımı (önceden işaretli olmayan bir checkbox). "Sağlık verilerimin bu uygulama tarafından işlenmesini kabul ediyorum" gibi net bir ifade.
3. **Rıza kaydı** — Yukarıdaki `ConsentRecord` tablosu, hangi metin sürümüne ne zaman onay verildiğini saklar. Metin güncellenirse yeniden onay istenmeli.
4. **Kullanıcı hakları (KVKK md. 11):**
   - Verilerini dışa aktarabilme (JSON/PDF export) — Kullanıcı Bilgilerim sayfasında bir "Verilerimi İndir" butonu.
   - Hesabını ve tüm verilerini silebilme — "Hesabı Sil" akışı, geri dönüşü olmayan bir onay adımıyla.
5. **Veri asgarileştirme** — Sadece işlevsel olarak gerekli veri toplanmalı; "yağ oranı, vücut ölçüleri" gibi alanlar zaten opsiyonel işaretlenmiş, bu doğru bir yaklaşım.

> **Önemli:** Bu bölümdeki metin taslakları teknik uygulamayı yönlendirmek içindir, hukuki tavsiye değildir. Store'a yayınlamadan önce gerçek Aydınlatma Metni ve Açık Rıza Metni'ni bir avukata hazırlatıp/kontrol ettirmen gerekiyor.

## "Tıbbi Tavsiye Değildir" İlkesi

Uygulama hiçbir yerde tanı koymamalı, tedavi önermemeli. Bunun yerine:
- Beslenme önerilerinde: *"Bu bir öneridir, doğru karar için bir diyetisyene danışmanı tavsiye ederiz."*
- Kan tahlili hatırlatmasında: *"Bu uygulama bir sağlık hizmeti sağlamaz, yalnızca hatırlatma aracıdır."*
- Stres/nefes egzersizlerinde: *"Bu öneriler doktor desteğinin yerine geçmez."*

Bu ifadeler her ilgili ekranın altında sabit, göz ardı edilemeyecek şekilde (ama rahatsız etmeyen bir tipografiyle) yer almalı. Aynı zamanda App Store / Play Store'un sağlık uygulamaları politikaları (tanı/tedavi iddiası olmayan "wellness" kategorisi) için bu netlik gerekli.

## Güvenlik Kuralları

| Alan | Kural |
|---|---|
| **Kimlik doğrulama** | Supabase Auth (email/OTP veya sosyal giriş). Access token `expo-secure-store`'da şifreli saklanır, asla `AsyncStorage`'da düz metin değil. |
| **Yetkilendirme** | Supabase **Row Level Security (RLS)** açık — her kullanıcı sadece `user_id = auth.uid()` olan satırları görebilir/değiştirebilir. Backend API'de de her sorguda `userId` kontrolü tekrarlanır (defense in depth). |
| **Veri aktarımı** | Tüm API çağrıları HTTPS üzerinden. Hassas alanlar (kan grubu, tahlil tarihi) API loglarına yazılmamalı. |
| **Girdi doğrulama** | Her API endpoint'i Zod şemasıyla doğrulanır — hem mobile hem backend aynı şemayı `packages/shared-types`'tan import eder. |
| **Rate limiting** | API route'larında temel rate limiting (ör. Upstash Redis + `@upstash/ratelimit`) — özellikle auth ve export endpoint'lerinde. |
| **Sırlar** | `SUPABASE_SERVICE_ROLE_KEY` sadece backend ortam değişkeninde; mobil build'e asla gömülmez. |
| **Cihaz kaybı senaryosu** | Access token kısa ömürlü (1 saat), refresh token güvenli storage'da; kullanıcı "tüm cihazlardan çıkış yap" seçeneğine sahip olmalı (ayarlarda). |

## Sırada Ne Var?

Bu temel kurulduktan sonra özellik dosyalarına geçilebilir: `03-OZELLIK-GOZ-YORGUNLUGU.md` ile başlamak önerilir (en basit özellik, sistemi uçtan uca test etmek için iyi bir başlangıç).
