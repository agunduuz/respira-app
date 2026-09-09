import { Platform } from "react-native";

/**
 * Skia çizimi bu platformda kullanılabilir mi?
 *
 * Native'de kütüphane uygulamaya linklenmiş — her zaman evet.
 *
 * Web'de CanvasKit WASM üzerinden çalışıyor ve şu an
 * @shopify/react-native-skia 2.6.2 ile canvaskit-wasm 0.41.0 arasında bir
 * uyumsuzluk var: Skia `CanvasKit.PathBuilder` bekliyor, bu sürümün çalışma
 * zamanı onu sunmuyor. Kontrolü tek yerde toplayıp Canvas kullanan bileşenleri
 * koşullu çiziyoruz — aksi halde tek bir Canvas tüm ekranı hata sınırına
 * düşürüyor.
 */
export function isSkiaUsable(): boolean {
  if (Platform.OS !== "web") return true;
  const ck = (globalThis as { CanvasKit?: { PathBuilder?: unknown } }).CanvasKit;
  return !!ck && ck.PathBuilder !== undefined;
}
