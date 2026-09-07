# 08 — Bildirim Mimarisi

5 özelliğin de kendi bildirim ihtiyacı var (göz, öğün, postür, su, stres) + kan tahlili hatırlatması. Bunları özellik başına ayrı ayrı inşa etmek yerine, tek bir ortak altyapı üzerine kurup her özellik bunu kendi parametreleriyle kullanmalı.

## Neden Local Bildirim, Push Değil?

Bu uygulamadaki tüm hatırlatmalar (mola zamanı, su içme zamanı, nefes egzersizi) **kullanıcının kendi ayarladığı, cihazda hesaplanabilen** zamanlamalardır — sunucudan tetiklenmesi gereken bir olay yok. Bu yüzden `expo-notifications` ile **zamanlanmış local bildirim** yeterli ve tercih edilir:

- Sunucu/push altyapısı (Expo Push Service, FCM/APNs kurulumu) gerektirmiyor → daha az karmaşıklık, V1 için ideal.
- Uygulama tamamen kapatılsa bile çalışır çünkü zamanlama işletim sistemine devredilmiş durumda.
- İleride (ticarileştirme aşamasında) sunucu tarafından tetiklenen akıllı/kişiselleştirilmiş bildirimler gerekirse (ör. "3 gündür su hedefini tutturamadın"), o zaman Expo Push Notifications'a geçilebilir — bu, mimariyi bozmadan eklenebilecek bir V2 katmanı.

## İzin İsteme Prensibi

**Her özellik kendi bildirimini kendi anında ister** — kullanıcı ilk açılışta tek seferde "her şeye izin ver" ile bunaltılmaz. Örnek akış:
1. Kullanıcı Göz Yorgunluğu özelliğini ilk kez açar → o an sistem bildirim izni istenir, sadece göz molası bildirimi için.
2. Kullanıcı Su Tüketimi özelliğini ilk kez açar → ayrı bir uygulama-içi onay + (sistem izni zaten verilmişse tekrar sorulmaz, sadece kategori bazında `NotificationPreference.enabled` güncellenir).

**İki katmanlı izin modeli:**
- **Sistem izni** (`Notifications.requestPermissionsAsync()`) — cihaz genelinde bir kez istenir, iOS/Android ayarlarını kapsar.
- **Uygulama içi tercih** (`NotificationPreference` tablosu) — kategori bazında (göz/su/postür/stres/öğün/kan tahlili) açık/kapalı. Sistem izni verilmiş olsa bile, kullanıcı belirli bir kategoriyi uygulama içinden kapatabilir.

## Bildirim Kategorileri

| Kategori | Tetikleyici | Varsayılan Sıklık | Özelleştirilebilir mi |
|---|---|---|---|
| Göz yorgunluğu | Zamanlayıcı (interval) | 20 dk | Evet — dakika/saniye |
| Öğün hatırlatma | Sabit saat | Kullanıcının tanımladığı öğün saatleri | Evet — saat bazında |
| Postür/duruş molası | Saat başı | Kullanıcının belirttiği dakika kadar | Evet — mesai saatleri + süre |
| Su tüketimi | Saatlik dağılım | Uyanıklık saatlerine eşit dağıtılmış | Evet — hedef ve uyku/uyanma saatleri |
| Stres/nefes molası | Günlük dengeli dağıtım | Kullanıcının seçtiği günlük sayı (1-2 / 3-4 / 5+) | Evet |
| Kan tahlili hatırlatması | Tek seferlik, uzun aralık | 3/6/12 ay (kullanıcı seçimi) | Evet |

## Sessiz Saatler (Quiet Hours)

Tüm kategoriler için ortak bir "rahatsız etme" penceresi desteklenir (`NotificationPreference.quietHoursStart/End`, varsayılan 22:00-08:00). Bu pencere içinde hiçbir kategoriden bildirim gönderilmez — zamanlama yapılırken bu aralık atlanır.

## Teknik Uygulama Notu

```ts
// packages/shared-types veya apps/mobile/lib/notifications.ts içinde
// merkezi bir yardımcı fonksiyon — her özellik bunu kendi parametreleriyle çağırır

async function scheduleRepeatingReminder(params: {
  category: NotificationCategory;
  title: string;
  body: string;
  intervalSeconds: number;
  quietHours?: { start: string; end: string };
}) {
  // 1. Kategoriye ait önceki planlanmış bildirimleri iptal et
  // 2. quietHours varsa, intervalSeconds'ı bu pencereyi atlayacak şekilde hesapla
  // 3. Notifications.scheduleNotificationAsync ile yeniden kur
}
```

Bu fonksiyon her özellik dosyasındaki (`03`–`07`) bildirim ihtiyacı için tekrar kullanılmalı — kod tekrarını önler ve sessiz saatler mantığının her yerde tutarlı çalışmasını garanti eder.

## Kabul Kriterleri

- [ ] Her kategori kendi bağımsız izniyle çalışıyor, biri kapalıyken diğerleri etkilenmiyor.
- [ ] Sessiz saatler tüm kategorilerde tutarlı şekilde uygulanıyor.
- [ ] Ayarlar değiştiğinde (ör. göz molası süresi), ilgili kategorinin bildirim planı doğru şekilde iptal edilip yeniden kuruluyor.
- [ ] Gerçek cihazda, uygulama tamamen kapatıldıktan sonra da bildirimler geliyor.
