# 04 — Özellik: Kan Şekeri / Beslenme Takibi

Bu, uygulamanın en kapsamlı modülü. 5 adımlı bir onboarding anketi + günlük öğün takibi + öneriler + raporlama içeriyor.

## 5 Adımlı Kullanıcı Tanıma Anketi

### Adım 1 — Öğün Sayısı
- Kullanıcı günde kaç öğün tükettiğini seçer (ör. 3, 4, 5, 6 öğün).
- Eğer 3'ten fazla öğün seçildiyse, öğün saatlerini opsiyonel olarak tanımlayabilir.
- Öğün saati tanımlanmışsa ve bu saatler için bildirim istiyorsa **ayrı bir izin** istenir (`ConsentType.BILDIRIM_IZNI_OGUN`).

### Adım 2 — Fiziksel Profil
**Zorunlu alanlar:**
- Yaş, Boy (cm), Kilo (kg)
- Haftalık antrenman sıklığı (Hiçbir zaman / 1-2 gün / 2-3 gün / 4-5 gün / Her gün)
- Antrenman türü (Koşu, Yoga, Fitness, Crossfit, Calisthenics, Hybrid, Diğer)
- Hedeflenen vücut tipi (Atletik / Kas kütlesi kazanımı / Kilo verme / Kiloda sabit kalma / Yağ yakımı)

**Opsiyonel alanlar:**
- Yağ oranı (%)
- Vücut ölçüleri: boyun, kol, bel, kalça (cm)

### Adım 3 — Makro Hedefleri (Bilimsel Referanslı Otomatik Hesaplama)

Kullanıcı karbonhidrat/protein/yağ/kalori değerlerini manuel girebilir, **ama varsayılan olarak Adım 1-2'deki verilerden otomatik hesaplanır.**

**Hesaplama yöntemi (referans: Mifflin-St Jeor denklemi + aktivite çarpanı — spor beslenmesi literatüründe en yaygın kabul gören BMR/TDEE hesaplama yöntemlerinden biri):**

```
BMR (Bazal Metabolizma Hızı):
  Erkek:  BMR = 10 × kilo(kg) + 6.25 × boy(cm) − 5 × yaş + 5
  Kadın:  BMR = 10 × kilo(kg) + 6.25 × boy(cm) − 5 × yaş − 161

TDEE (Toplam Günlük Enerji İhtiyacı) = BMR × Aktivite Çarpanı
  Hiçbir zaman antrenman   → ×1.2
  1-2 gün/hafta            → ×1.375
  2-3 gün/hafta            → ×1.465
  4-5 gün/hafta            → ×1.55
  Her gün                  → ×1.725

Hedefe göre kalori ayarı:
  Kilo verme      → TDEE − (TDEE × 0.15 ile 0.20 arası)
  Kas kazanımı    → TDEE + (TDEE × 0.10 ile 0.15 arası)
  Sabit kalma / Atletik / Yağ yakımı → TDEE'ye yakın, hedefe göre küçük ayar

Makro dağılımı:
  Protein  → 1.6–2.2 g / kg vücut ağırlığı (hedefe göre; kas kazanımında üst sınır)
  Yağ      → Toplam kalorinin %25-30'u
  Karbonhidrat → Kalan kalori
```

- Bu formüller ekranın altında kısa bir FYI ile açıklanmalı: *"Bu değerler Mifflin-St Jeor formülüne dayalı genel bir tahmindir. Kesin ihtiyacın için bir diyetisyene danışmanı öneririz."*
- Kullanıcı önerilen değerleri değiştirdiğinde, değiştirdiği alanın yanında küçük bir "varsayılana dön" seçeneği olmalı.

### Adım 4 — Sağlık Bilgileri (Opsiyonel) ve Kan Tahlili Hatırlatması

**Opsiyonel alanlar:**
- Kan grubu
- Şeker ihtiyaç oranı (kullanıcı biliyorsa serbest metin/sayı)
- Son kan tahlili tarihi

**Hatırlatma izni akışı:**
1. "Bir sonraki kan tahlili için hatırlatma bildirimi almak ister misin?" sorulur.
2. Evet ise: "Ne kadar sürede hatırlatılmak istersin?" (3 ay / 6 ay / 12 ay / özel) seçimi alınır.
3. Bu adımda **zorunlu olarak** şu ibare gösterilir ve onaylatılır:

   > *"Bu uygulama bir sağlık hizmeti sunmaz, tanı veya tedavi önermez. Kan tahlili hatırlatması yalnızca bir takvim hatırlatma aracıdır, tıbbi bir öneri değildir."*

   Bu onay, `ConsentRecord` tablosuna `BILDIRIM_IZNI_KAN_TAHLILI` tipiyle kaydedilir.
- **Türkiye hukuku notu:** Bu ibarenin yasal olarak yeterli olup olmadığı, App Store/Play Store'un sağlık uygulaması politikaları ve KVKK'nın özel nitelikli veri şartları göz önünde bulundurularak, yayın öncesi bir hukuk danışmanına onaylatılmalı. Buradaki metin bir taslaktır.

### Adım 5 — Özet ve Başlangıç
- Girilen tüm bilgiler (Adım 1-4) tek ekranda özetlenir.
- Kullanıcı "Düzenle" ile herhangi bir adıma geri dönebilir.
- "Başla" ile profil kaydedilir ve günlük takip aktif hale gelir.

## Günlük Öğün Girişi — İki Mod

Kullanıcı her öğünü iki şekilde girebilir:

1. **Basit mod:** Sadece serbest metin (ör. "Yumurta"). Bu durumda besin değeri hesaplaması/takibi **yapılmaz** — sadece bir günlük not olarak kaydedilir.
2. **Detaylı mod:** Gramaj veya adet girilir (ör. "2 adet yumurta" / "150 gr tavuk göğsü"). Bu durumda mümkünse kalori, yağ, protein, karbonhidrat ve lif değerleri hesaplanıp gösterilir.

İki modda da, girilen öğünden sonra **öğle yemeği önerisi** sunulur (bkz. aşağı). Öneri her zaman şu ifadeyle birlikte gösterilir:

> *"Bu bir öneridir. Doğru ve kişiselleştirilmiş beslenme kararları için bir diyetisyene danışmanı tavsiye ederiz."*

## Öğün Önerisi Mantığı

- Girdi detaylı mod ise: kahvaltıda alınan makrolar ile günlük hedef karşılaştırılır, öğle önerisi eksik kalan makroyu (özellikle protein/lif) tamamlayacak yönde oluşturulur.
- Girdi basit mod ise (sadece "yumurta" gibi): sayısal karşılaştırma yapılamayacağından, öneri daha genel bir dengeleme mantığıyla verilir (ör. "Kahvaltında proteine ağırlık verdiysen öğlen sebze ağırlıklı gitmek dengeleyici olabilir").

## Ertesi Gün Referans Alma

- Her gün, bir önceki günün öğün verileriyle karşılaştırılır.
- Eğer önceki gün bir öğün (ör. kahvaltı) hedeflenen makro değerlerinin belirgin altında kaldıysa, o gün için kahvaltı önerisi bunu telafi edecek şekilde somutlaştırılır:
  > *"Dün kahvaltın hedefindeki proteinin altında kaldı. Bugün tabağına ek olarak ~1 ölçek (30g) yoğurt veya 2 adet yumurta eklemeyi düşünebilirsin."*
- Bu mantık sadece **detaylı mod**la girilmiş önceki gün verileri için çalışabilir (basit mod'da sayısal referans yok).

## Günlük / Haftalık / Aylık Raporlama

- **Günlük:** Gün sonunda otomatik oluşan rapor — bugünün toplam kalori/protein/karb/yağ/lif değerleri, hedefle karşılaştırma (grafik + kısa FYI metni).
- **Haftalık / Aylık:** Kullanıcının açıkça istediği gibi, **öğünlerin kendisi değil, değerlerin karşılaştırması** gösterilir — yani "pazartesi ne yedin" değil, "haftalık ortalama protein alımın hedefe göre %X" gibi trend grafikleri (Victory Native ile çizgi/alan grafik).

## Favoriye Ekleme

- Bir gün veya tek bir öğün favoriye eklenebilir (`isFavorite = true`).
- Favori olmayan öğün/günlerin ham içeriği (serbest metin, gramaj detayları) belirli bir süre sonra temizlenir, sadece toplam besin değerleri (metrikler) kalır — mantığın detayı `02-VERI-MODELI-VE-GUVENLIK.md` içinde.
- Favori öğünler "Kullanıcı Bilgilerim" altında ayrı bir listede, tam içerikleriyle görüntülenebilir.

## Veri Modeli (Prisma eki)

```prisma
model NutritionProfile {
  id                String   @id @default(uuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id])

  mealsPerDay       Int
  mealTimes         Json?    // [{ label: "Kahvaltı", time: "08:00" }, ...]

  age               Int
  heightCm          Float
  weightKg          Float
  trainingFrequency TrainingFrequency
  trainingType      String
  bodyGoal          BodyGoal
  bodyFatPercent    Float?
  measurements      Json?    // { neck, arm, waist, hip }

  targetCalories    Int
  targetProteinG    Float
  targetCarbsG      Float
  targetFatG        Float
  macrosCustomized  Boolean  @default(false)

  bloodType         String?
  sugarNeedRate     String?
  lastBloodTestDate DateTime?
  bloodTestReminderMonths Int?

  updatedAt         DateTime @updatedAt
}

enum TrainingFrequency {
  NEVER
  ONE_TO_TWO
  TWO_TO_THREE
  FOUR_TO_FIVE
  DAILY
}

enum BodyGoal {
  ATHLETIC
  MUSCLE_GAIN
  WEIGHT_LOSS
  MAINTENANCE
  FAT_LOSS
}

model MealEntry {
  id             String   @id @default(uuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  date           DateTime @db.Date
  mealLabel      String   // "Kahvaltı", "Öğle", vb.
  mode           MealMode
  rawText        String?  // basit mod veya not
  foodItemsDetail Json?   // detaylı mod: [{ name, amount, unit, calories, protein, carbs, fat, fiber }]
  calories       Int?
  proteinG       Float?
  carbsG         Float?
  fatG           Float?
  fiberG         Float?
  isFavorite     Boolean  @default(false)
  createdAt      DateTime @default(now())
}

enum MealMode {
  SIMPLE
  DETAILED
}

model DailyNutritionSummary {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  date          DateTime @db.Date
  totalCalories Int
  totalProteinG Float
  totalCarbsG   Float
  totalFatG     Float
  totalFiberG   Float

  @@unique([userId, date])
}
```

## Kabul Kriterleri

- [ ] 5 adımlı anket sırayla tamamlanabiliyor, her adımdan geri dönülebiliyor.
- [ ] Adım 3'teki makro hesaplaması Adım 1-2 verileriyle doğru şekilde otomatik dolduruluyor ve kullanıcı değiştirebiliyor.
- [ ] Basit ve detaylı mod arasında geçiş net, kullanıcıya hangi modda takip yapılıp yapılmadığı açıkça gösteriliyor.
- [ ] Öğle önerisi her zaman diyetisyen uyarısıyla birlikte gösteriliyor.
- [ ] Ertesi gün referans mantığı sadece detaylı mod verisiyle çalışıyor, basit moddan yanlış sayısal çıkarım yapmıyor.
- [ ] Haftalık/aylık raporlar öğün içeriği değil, değer karşılaştırması gösteriyor.
- [ ] Favori olmayan kayıtlar zamanla temizleniyor, metrikler korunuyor.
- [ ] Kan tahlili hatırlatma izni, yasal uyarı metniyle birlikte açıkça alınıyor.
