# 07 — Özellik: Stres Yönetimi

## Amaç

Kullanıcının stres yoğunluğunu öğrenip, seviyesine uygun kısa nefes egzersizleri ve öneriler sunmak.

## Stres Seviyesi Sınıflandırma

Basit bir öz-değerlendirme anketiyle başlar (günlük veya istendiğinde tekrarlanabilir):
- 1-5 arası ölçek ("Şu an ne kadar gergin hissediyorsun?") veya kategorik seçim (Düşük / Orta / Yüksek).
- Bu seviyeye göre önerilen egzersiz türü ve süresi değişir.

## 5 Dakikalık Nefes Egzersizleri

Her yerde (masada, ayakta, herkesin içinde fark ettirmeden) yapılabilecek teknikler, bilimsel referanslarıyla:

| Teknik | Uygulama | Ne zaman önerilir |
|---|---|---|
| **Kutu nefesi (box breathing)** | 4 sn nefes al – 4 sn tut – 4 sn ver – 4 sn tut, tekrarla | Orta yoğunlukta stres, hızlı odaklanma gerektiğinde |
| **4-7-8 tekniği** | 4 sn nefes al – 7 sn tut – 8 sn ver | Yüksek stres, sakinleşmeye ihtiyaç olduğunda |
| **Diyaframatik (karın) nefesi** | Burundan yavaş nefes al, karnın şişsin, ağızdan yavaş ver | Düşük-orta stres, genel gevşeme |

Her teknik ekranda görsel bir rehberle desteklenir — Skia ile genişleyip daralan bir daire animasyonu (nefes alma/verme ritmine senkronize), opsiyonel olarak 3D katmanda yumuşak hareket eden bir "orb" (bkz. `01-TASARIM-SISTEMI.md` — 3D katman burada kullanılabilecek en uygun yer).

## Farklı Öneri Tipleri

Sadece nefes egzersiziyle sınırlı kalınmaz, seviyeye göre alternatif öneriler de sunulur:
- Kısa yürüyüş önerisi (özellikle postür modülüyle çapraz bağlantılı — mümkünse aynı mola penceresinde birleştirilebilir)
- Kısa germe hareketleri
- Basit farkındalık (mindfulness) egzersizi — ör. "5-4-3-2-1" duyusal farkındalık tekniği

## Sıklık ve Bildirim

- Kullanıcıya "Günde kaç kez bu tür bir mola almak istersin?" sorulur (ör. 1-2 / 3-4 / 5+).
- Bu bilgiye göre bildirim izni istenir (`ConsentType.BILDIRIM_IZNI_STRES`) ve gün içine dengeli dağıtılan hatırlatmalar planlanır.

## Yasal/Bilgilendirici Uyarı

Her egzersiz ve öneri ekranında sabit bir ifade:

> *"Bu öneriler genel bilgilendirme amaçlıdır ve doktor desteğinin yerini tutmaz. Yoğun veya sürekli stres yaşıyorsan bir uzmana danışmanı öneririz."*

## Veri Modeli (Prisma eki)

```prisma
model StressProfile {
  id                    String   @id @default(uuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id])
  desiredSessionsPerDay Int
  updatedAt             DateTime @updatedAt
}

model BreathingSession {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  stressLevel   Int      // 1-5
  technique     String   // "box" | "4-7-8" | "diaphragmatic"
  completedAt   DateTime @default(now())
  durationSeconds Int
  status        SessionStatus
}

enum SessionStatus {
  COMPLETED
  SKIPPED
}
```

## Kabul Kriterleri

- [ ] Stres seviyesi anketi, egzersiz önerisini doğru şekilde etkiliyor.
- [ ] Nefes animasyonu, seçilen tekniğin gerçek ritmiyle (ör. 4-7-8) senkronize.
- [ ] Kullanıcının belirttiği günlük sıklığa göre bildirimler dengeli dağıtılıyor.
- [ ] Doktor desteği uyarısı her egzersiz ekranında görünüyor.
