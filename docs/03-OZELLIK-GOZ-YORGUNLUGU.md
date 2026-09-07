# 03 — Özellik: Göz Yorgunluğu

## Amaç

20-20-20 kuralına (her 20 dakikada bir, 20 saniye boyunca 6 metre uzağa bakma) dayalı, özelleştirilebilir bir sayaç + uygulama kapalıyken de çalışan hatırlatma + uyum analizi.

## Ekranlar

1. **Ana Sayaç Ekranı** — Kalan süreyi büyük, okunaklı bir sayaçla gösterir (Skia ile çizilmiş dairesel ilerleme göstergesi). Sayaç dolduğunda 20 saniyelik "uzağa bak" ekranı devreye girer (basit, sakinleştirici bir animasyon — göz dinlendirme anını görsel olarak da destekler).
2. **Ayarlar** — Varsayılan 20 dk / 20 sn değerleri, kullanıcı tarafından değiştirilebilir (dakika ve saniye ayrı ayrı).
3. **Kullanıcı Bilgilerim → Göz Analizi** — Günlük / Haftalık / Aylık uyum raporu.

## Sayaç Mantığı

- Varsayılan: 20 dakika çalışma → 20 saniye mola.
- Kullanıcı hem dakikayı hem saniyeyi bağımsız değiştirebilir (ör. 15 dk / 30 sn).
- Sayaç arka planda da çalışmalı — uygulama minimize edildiğinde saymayı kaybetmemeli. Bu, cihaz saatine göre zamanlanmış bildirimlerle sağlanır (bkz. aşağıdaki Bildirim bölümü ve `08-BILDIRIM-MIMARISI.md`).
- Kullanıcı bir molayı "tamamladım" veya "atla" olarak işaretleyebilir — bu, uyum oranı hesaplamasının temelini oluşturur.

## Bildirim — Uygulama Kapalıyken de Çalışmalı

React Native'de arka planda sürekli çalışan bir zamanlayıcı yerine, **`expo-notifications` ile önceden zamanlanmış tekrarlayan local bildirimler** kullanılır:

```ts
import * as Notifications from 'expo-notifications';

async function scheduleEyeStrainReminders(intervalMinutes: number) {
  await Notifications.cancelAllScheduledNotificationsAsync(); // eski planı temizle
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Gözlerine mola ver',
      body: '20 saniye boyunca 6 metre uzağa bak.',
      sound: true,
    },
    trigger: {
      seconds: intervalMinutes * 60,
      repeats: true,
    },
  });
}
```

Bu yaklaşımın avantajı: bildirim, işletim sistemi tarafından zamanlanır ve uygulama tamamen kapatılsa (force-quit) bile tetiklenir — çünkü sorumluluk uygulamadan işletim sistemine devredilmiş olur. Kullanıcı ayarı değiştirdiğinde (`intervalMinutes`), önceki plan iptal edilip yenisi kurulur.

**İzin akışı:** İlk kullanımda sistem bildirim izni istenir (`Notifications.requestPermissionsAsync()`). Reddedilirse, uygulama içi (in-app) bir banner ile sayaç yine çalışır ama bildirim gönderilmeyeceği açıkça belirtilir.

## Analiz (Kullanıcı Bilgilerim → Göz Analizi)

- **Günlük:** Bugün kaç mola tetiklendi, kaçı tamamlandı, kaçı atlandı → uyum yüzdesi.
- **Haftalık:** Gün bazlı çubuk grafik (Victory Native) — hangi günler daha düşük uyum gösterdi.
- **Aylık:** Trend çizgisi + ortalama uyum oranı.
- Her rapor altında kısa bir FYI: *"Bu hafta uyum oranın %X. Düzenli mola vermek göz kuruluğu ve gerilim tipi baş ağrısı riskini azaltabilir."*

## Veri Modeli (Prisma eki)

```prisma
model EyeStrainSettings {
  id               String @id @default(uuid())
  userId           String @unique
  user             User   @relation(fields: [userId], references: [id])
  intervalMinutes  Int    @default(20)
  breakSeconds     Int    @default(20)
  updatedAt        DateTime @updatedAt
}

model EyeStrainSession {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  triggeredAt  DateTime @default(now())
  status       EyeStrainStatus
}

enum EyeStrainStatus {
  COMPLETED
  SKIPPED
  MISSED  // bildirime hiç yanıt verilmedi
}
```

## Kabul Kriterleri

- [ ] Varsayılan 20dk/20sn ile sayaç doğru çalışıyor.
- [ ] Kullanıcı dakika ve saniyeyi bağımsız değiştirebiliyor, değişiklik anında bildirim planına yansıyor.
- [ ] Uygulama tamamen kapatıldıktan sonra bile bildirim geliyor (gerçek cihazda test edilmeli — simülatörde local bildirim davranışı bazen farklıdır).
- [ ] Günlük/haftalık/aylık analiz ekranları doğru uyum oranını hesaplıyor.
- [ ] Bildirim izni reddedilirse uygulama çökmüyor, kullanıcı bilgilendiriliyor.
