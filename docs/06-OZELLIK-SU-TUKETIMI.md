# 06 — Özellik: Su Tüketimi

## Amaç

Kişiselleştirilmiş su hedefi, hızlı giriş seçenekleri ve animasyonlu günlük ilerleme gösterimi.

## Hedef Hesaplama

Kullanıcının kilosuna göre önerilen günlük su miktarı otomatik hesaplanır:

```
Önerilen su (ml) = kilo(kg) × 33
```

Bu, genel beslenme/hidrasyon literatüründe yaygın kullanılan bir kaba tahmin formülüdür (kişiye, iklime ve aktivite düzeyine göre değişebilir). Ekранda kısa bir not olarak belirtilmeli: *"Bu genel bir tahmindir; sıcak hava, yoğun egzersiz gibi durumlarda ihtiyacın artabilir."* Kullanıcı bu hedefi manuel olarak değiştirebilir.

## Giriş Seçenekleri

Hızlı giriş butonları:
- 1 su bardağı (~200 ml)
- 0.5 L şişe
- 1 L şişe
- 1.5 L şişe
- Özel miktar (manuel giriş)

Her giriş anlık olarak günlük toplama eklenir ve animasyon güncellenir.

## Saatlik Dağılım Önerisi

Günlük hedef, kullanıcının uyanık olduğu saatlere (varsayılan 08:00-23:00, ayarlardan değiştirilebilir) eşit dağıtılır ve "şu ana kadar içmen gereken" referans çizgisi gösterilir:

```
Saatlik hedef = Günlük hedef / uyanık saat sayısı
```

Örnek: 2500 ml hedef, 15 saatlik uyanıklık → saatte ~167 ml referans. Ekranda "Şu ana kadar: 900ml içtin, hedefin 1000ml" gibi karşılaştırmalı gösterim.

## Animasyonlu Gösterim

Günün sonunda (ve gün içinde her an) doldurulan bir "su bardağı/şişe" animasyonu:
- **Teknik:** `@shopify/react-native-skia` ile çizilen bir konteyner + dalga (wave) efekti, içilen miktar arttıkça yükselen sıvı seviyesi.
- Hedefe ulaşıldığında kısa bir kutlama animasyonu (Lottie ile hazır bir "tamamlandı" animasyonu tetiklenebilir).

## Bildirim

- Kullanıcı su hatırlatma bildirimi izni verirse, saatlik dağılım hedefine göre periyodik hatırlatmalar gönderilir (bkz. `08-BILDIRIM-MIMARISI.md`).
- Eğer kullanıcı belirlenen saatte hedefinin gerisindeyse, bildirim metni buna göre uyarlanabilir: *"Bugün biraz gerideyiz, bir bardak su iyi gelir."*

## Veri Modeli (Prisma eki)

```prisma
model WaterGoal {
  id             String   @id @default(uuid())
  userId         String   @unique
  user           User     @relation(fields: [userId], references: [id])
  dailyTargetMl  Int
  isCustomized   Boolean  @default(false)
  wakeTime       String   @default("08:00")
  sleepTime      String   @default("23:00")
  updatedAt      DateTime @updatedAt
}

model WaterIntakeLog {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  amountMl  Int
  loggedAt  DateTime @default(now())
}
```

## Kabul Kriterleri

- [ ] Hedef, kilo bilgisinden otomatik hesaplanıyor ve kullanıcı tarafından değiştirilebiliyor.
- [ ] Hızlı giriş butonları (bardak/0.5L/1L/1.5L/özel) doğru çalışıyor.
- [ ] Animasyon, gün içindeki gerçek toplamı doğru yansıtıyor.
- [ ] Saatlik referans hesaplaması uyanıklık saatlerine göre doğru dağıtılıyor.
- [ ] Bildirim izni verilmişse periyodik hatırlatma geliyor.
