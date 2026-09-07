# 05 — Özellik: Postür ve Ergonomi Takibi

## Amaç

Kullanıcının iş/yaşam tarzına özel duruş molaları ve egzersiz önerileri sunmak — ofiste, herkesin içinde bile yapılabilecek, ortama uygun hareketlerle.

## Onboarding Formu

**Meslek/Yaşam Tarzı Bilgileri:**
- Çalışma şekli: Masa başı (oturarak) / Ayakta hareketli / Karma
- İş yoğunluğu: Hafif / Orta / Ağır fiziksel yük
- Ekran başında zorunlu çalışma var mı? (Evet/Hayır, varsa günde kaç saat)
- Meslek tipi (serbest metin veya kategori: Yazılım/Ofis, Sağlık, Perakende/Ayakta hizmet, Üretim/Fiziksel iş, Diğer)

**Zaman Bilgisi:**
- "Saat başı kaç dakika kendine ayırabilirsin?" (1-2 dk / 3-5 dk / 5+ dk)
- Bu bilgiye bağlı olarak bildirim izni istenir (`ConsentType.BILDIRIM_IZNI_POSTUR`).

## Egzersiz Üretim Mantığı

Öneriler, kullanıcının belirttiği **ortam** ve **süre**ye göre filtrelenir. İki ana kategori:

1. **Masa başı / sessiz hareketler** (herkesin içinde, oturarak yapılabilir): Boyun yan germe, omuz silkme/döngü, bilek germe, oturarak bel dönüşü, göğüs açma.
2. **Ayakta / daha hareketli çalışanlar için**: Baldır germe, kalça açıcı hareketler, yürüyerek omuz gevşetme, diz-göğüs germe.

Öneri seçimi, kullanıcının verdiği süreye (1-2 dk / 3-5 dk / 5+ dk) göre hareket sayısı ve süresi ayarlanır. Her hareket kısa bir görsel/animasyon (Skia ile basit stick-figure animasyonu veya Lottie) ile desteklenmeli.

## Meslek Türüne Göre Bilgilendirici FYI

Kullanıcının verdiği meslek/çalışma bilgisine göre, sayaç ekranının altında dönüşümlü olarak kısa bilgi notları gösterilir. Örnekler:

| Meslek/durum | Örnek FYI |
|---|---|
| Masa başı, ekran yoğun | "Sandalye yüksekliğini dizlerin 90 derece olacak şekilde ayarla." |
| Masa başı, ekran yoğun | "Ekranın üst kenarı göz hizanda olmalı, boynunu öne eğmeden bakabilmelisin." |
| Ayakta hareketli | "Uzun süre aynı noktada durmak yerine, mümkünse ağırlığını periyodik olarak bir bacaktan diğerine aktar." |
| Ağır fiziksel iş | "Kaldırma hareketlerinde belini değil dizlerini kullanmaya özen göster." |

Bu liste Claude Code tarafından genişletilebilir; her FYI kısa (1-2 cümle) ve jenerik tıbbi tavsiye niteliğinde olmayan, pratik ergonomi bilgisi olmalı.

## Bildirim

- Saat başı, kullanıcının belirttiği süre kadar bir "mola zamanı" bildirimi (bkz. `08-BILDIRIM-MIMARISI.md`).
- Kullanıcı mesai saatlerini tanımlayabilir (ör. 09:00-18:00) — bu saatler dışında bildirim gönderilmez (quiet hours mantığı, `NotificationPreference.quietHoursStart/End` alanları).

## Veri Modeli (Prisma eki)

```prisma
model PostureProfile {
  id                String   @id @default(uuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id])
  workStyle         WorkStyle
  workIntensity     WorkIntensity
  screenHoursPerDay Int?
  occupationType    String
  minutesPerHourAvailable Int
  workHoursStart    String?  // "09:00"
  workHoursEnd      String?  // "18:00"
  updatedAt         DateTime @updatedAt
}

enum WorkStyle {
  SEDENTARY
  STANDING_ACTIVE
  MIXED
}

enum WorkIntensity {
  LIGHT
  MODERATE
  HEAVY
}

model PostureBreakLog {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  triggeredAt  DateTime @default(now())
  status       BreakStatus
  exerciseSetId String? // hangi egzersiz seti önerildi
}

enum BreakStatus {
  COMPLETED
  SKIPPED
  MISSED
}
```

## Kabul Kriterleri

- [ ] Onboarding formu iş tarzı ve süre bilgisini doğru topluyor.
- [ ] Egzersiz önerileri kullanıcının belirttiği ortama (masa başı/ayakta) ve süreye uygun geliyor.
- [ ] Meslek türüne göre FYI mesajları rotasyonlu gösteriliyor.
- [ ] Bildirimler sadece tanımlı mesai saatleri içinde geliyor.
