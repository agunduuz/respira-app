/**
 * Göz ve Su ekranlarındaki "Biliyor muydun?" notları. Genel, pratik bilgi —
 * sağlık iddiası veya tıbbi tavsiye içermez. Duruş notları sunucudan geliyor
 * (docs/05, meslek türüne göre).
 */
export const EYE_TIPS = [
  "20-20-20 kuralı: her 20 dakikada bir, 20 saniye boyunca 6 metre uzağa bak.",
  "Ekrana bakarken göz kırpma sıklığı azalır; mola sırasında bilinçli olarak birkaç kez göz kırp.",
  "Ekranın üst kenarı göz hizanın biraz altında olursa gözlerin daha az açık kalır.",
  "Odanın ışığı ekranın parlaklığına yakın olduğunda göz daha az zorlanır.",
  "Ekranı kolunun boyu kadar uzakta tutmak iyi bir başlangıç mesafesidir.",
  "Uzağa bakarken bir pencereden dışarı bakmak ya da odanın en uzak köşesini seçmek yeterli.",
] as const;

export const WATER_TIPS = [
  "Susadığını hissettiğinde vücut zaten bir miktar su kaybetmiş olabilir; gün içine yayarak içmek daha kolay.",
  "Su içmeyi öğünlerle ilişkilendirmek alışkanlık kurmayı kolaylaştırır.",
  "Masanın üstünde hep dolu bir bardak ya da matara bulundurmak hatırlatma ihtiyacını azaltır.",
  "Hedefini tek seferde değil, saat başı küçük yudumlarla tamamlamak daha az zorlar.",
  "Sıcak havada ve hareketli günlerde su ihtiyacı artabilir.",
  "Uyanır uyanmaz bir bardak su içmek güne başlarken kolay bir ilk adım olur.",
] as const;

/** Günün notu: aynı gün içinde sabit, günler arasında dönüşümlü. */
export function tipOfTheDay(tips: readonly string[], date = new Date()): string {
  const dayNumber = Math.floor(date.getTime() / 86_400_000);
  return tips[dayNumber % tips.length];
}
