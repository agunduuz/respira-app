/**
 * Koşullu className birleştirici. NativeWind sınıf sırasını kendi çözdüğü için
 * tailwind-merge'e gerek yok; false/undefined değerleri eleyip birleştiriyoruz.
 */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
