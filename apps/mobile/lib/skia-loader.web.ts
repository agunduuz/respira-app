/**
 * Web'de Skia BİLİNÇLİ OLARAK yüklenmiyor.
 *
 * Denendi ve geri alındı: @shopify/react-native-skia 2.6.2, CanvasKit'ten
 * `PathBuilder` bekliyor; eşlik eden canvaskit-wasm 0.41.0'ın çalışma zamanı
 * bunu sunmuyor (tip tanımlarında var, runtime'da yok). CanvasKit yüklendiğinde
 * Skia'nın web modülü import anında bu API'ye dokunup TÜM uygulamayı hata
 * sınırına düşürüyor — yani yüklememek, yanlış sürümü yüklemekten iyi.
 *
 * Sonuç: web'de Canvas kullanan bileşenler lib/skia-available.ts üzerinden
 * kendilerini devre dışı bırakıyor; uygulamanın geri kalanı çalışıyor.
 * Hedef platformlar (iOS/Android) bundan etkilenmiyor, orada Skia native.
 */
export async function loadSkia(): Promise<void> {}
