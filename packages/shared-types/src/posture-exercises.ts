/**
 * Egzersiz kütüphanesi ve seçim mantığı — docs/05.
 *
 * Hareketler ortama göre iki kategoriye ayrılıyor: "quiet" (masa başında,
 * herkesin içinde, oturarak yapılabilir) ve "active" (ayakta / daha hareketli).
 * Seçim, kullanıcının saat başı ayırabildiği süreye göre set uzunluğunu
 * belirliyor.
 *
 * ⚠️ Bunlar genel ergonomi hareketleridir, tedavi amaçlı değildir.
 */

export type WorkStyle = "SEDENTARY" | "STANDING_ACTIVE" | "MIXED";
export type WorkIntensity = "LIGHT" | "MODERATE" | "HEAVY";

/** Hareketin yapılabileceği ortam. */
export type ExerciseSetting = "quiet" | "active";

export interface Exercise {
  id: string;
  name: string;
  /** Nasıl yapılacağı — tek cümle, ekipman gerektirmeyen. */
  instruction: string;
  setting: ExerciseSetting;
  /** Önerilen süre (saniye). */
  seconds: number;
}

export const EXERCISES: readonly Exercise[] = [
  // --- Masa başı / sessiz ---
  {
    id: "neck-side-stretch",
    name: "Boyun yan germe",
    instruction: "Başını yavaşça bir omzuna doğru yatır, 15 saniye bekle, diğer tarafa geç.",
    setting: "quiet",
    seconds: 30,
  },
  {
    id: "shoulder-rolls",
    name: "Omuz döngüsü",
    instruction: "Omuzlarını yavaşça geriye doğru çevir; nefesini tutma.",
    setting: "quiet",
    seconds: 30,
  },
  {
    id: "wrist-stretch",
    name: "Bilek germe",
    instruction: "Kolunu öne uzat, parmaklarını nazikçe geriye çek; iki eli de yap.",
    setting: "quiet",
    seconds: 30,
  },
  {
    id: "seated-twist",
    name: "Oturarak bel dönüşü",
    instruction: "Sandalyede otururken gövdeni yavaşça bir yana çevir, sonra diğer yana.",
    setting: "quiet",
    seconds: 40,
  },
  {
    id: "chest-opener",
    name: "Göğüs açma",
    instruction: "Ellerini arkanda birleştir, göğsünü öne doğru aç ve omuzlarını geriye al.",
    setting: "quiet",
    seconds: 30,
  },
  {
    id: "eye-distance",
    name: "Uzağa bakma",
    instruction: "Ekrandan uzaklaş, birkaç metre ötedeki bir noktaya odaklan.",
    setting: "quiet",
    seconds: 20,
  },

  // --- Ayakta / hareketli ---
  {
    id: "calf-stretch",
    name: "Baldır germe",
    instruction: "Bir adım öne çık, arkadaki bacağın topuğunu yere bastır.",
    setting: "active",
    seconds: 40,
  },
  {
    id: "hip-opener",
    name: "Kalça açıcı",
    instruction: "Bir ayağını öne al, kalçanı hafifçe öne doğru it; iki tarafa da yap.",
    setting: "active",
    seconds: 40,
  },
  {
    id: "walking-shoulder-release",
    name: "Yürüyerek omuz gevşetme",
    instruction: "Kısa bir tur at, yürürken kollarını serbest bırakıp omuzlarını salla.",
    setting: "active",
    seconds: 60,
  },
  {
    id: "knee-to-chest",
    name: "Diz-göğüs germe",
    instruction: "Bir dizini karnına doğru çek, dengeyi korumak için bir yere tutun.",
    setting: "active",
    seconds: 40,
  },
  {
    id: "weight-shift",
    name: "Ağırlık aktarma",
    instruction: "Ağırlığını yavaşça bir bacaktan diğerine aktar, birkaç kez tekrarla.",
    setting: "active",
    seconds: 30,
  },
];

/**
 * Kullanıcının saat başı ayırabildiği dakika, kaç saniyelik sete karşılık
 * geliyor. docs/05: 1-2 dk / 3-5 dk / 5+ dk.
 */
export function budgetSeconds(minutesPerHour: number): number {
  if (minutesPerHour <= 2) return 120;
  if (minutesPerHour <= 5) return 300;
  return 480;
}

/**
 * Çalışma şekline göre hangi ortamdaki hareketler uygun.
 * MIXED hem sessiz hem hareketli hareketleri alabilir.
 */
export function allowedSettings(workStyle: WorkStyle): ExerciseSetting[] {
  if (workStyle === "SEDENTARY") return ["quiet"];
  if (workStyle === "STANDING_ACTIVE") return ["active"];
  return ["quiet", "active"];
}

export interface ExerciseSet {
  /** Deterministik kimlik — hangi setin önerildiği loglanabilsin diye. */
  id: string;
  exercises: Exercise[];
  totalSeconds: number;
}

/**
 * Ortam ve süreye uygun bir egzersiz seti üretir.
 *
 * `rotation` her molada artan bir sayaç; aynı kullanıcı her seferinde aynı
 * hareketleri görmesin diye başlangıç noktasını kaydırıyor. Saf fonksiyon
 * kalması için rastgelelik yerine bu kullanılıyor — aynı girdi aynı seti
 * üretiyor, bu da test edilebilir ve loglanabilir olmasını sağlıyor.
 */
export function buildExerciseSet(params: {
  workStyle: WorkStyle;
  minutesPerHourAvailable: number;
  rotation: number;
}): ExerciseSet {
  const { workStyle, minutesPerHourAvailable, rotation } = params;

  const settings = allowedSettings(workStyle);
  const pool = EXERCISES.filter((e) => settings.includes(e.setting));
  const budget = budgetSeconds(minutesPerHourAvailable);

  const chosen: Exercise[] = [];
  let used = 0;

  // Havuzu rotasyon kadar kaydırarak dolaş; bütçe dolana kadar ekle.
  for (let i = 0; i < pool.length; i++) {
    const e = pool[(rotation + i) % pool.length];
    if (used + e.seconds > budget) continue;
    chosen.push(e);
    used += e.seconds;
  }

  // Bütçe en kısa hareketten bile küçükse en az bir hareket öner —
  // boş bir mola ekranı göstermek anlamsız olurdu.
  if (chosen.length === 0 && pool.length > 0) {
    const shortest = [...pool].sort((a, b) => a.seconds - b.seconds)[0];
    chosen.push(shortest);
    used = shortest.seconds;
  }

  return {
    id: `${workStyle}-${budget}-${rotation % pool.length}`,
    exercises: chosen,
    totalSeconds: used,
  };
}

/**
 * Mesai saatlerini "sessiz saat" penceresine çevirir.
 *
 * docs/05: bildirimler yalnızca mesai içinde gönderilir. Mevcut bildirim
 * altyapısı sessiz pencereyi ATLAYARAK planlama yapıyor, yani mesai dışını
 * sessiz ilan etmek yeterli — pencere tersine çevriliyor.
 *
 * Mesai tanımlı değilse null döner (sessiz saat yok, gün boyu bildirim).
 */
export function workHoursToQuietHours(
  workHoursStart: string | null | undefined,
  workHoursEnd: string | null | undefined
): { start: string; end: string } | null {
  if (!workHoursStart || !workHoursEnd) return null;
  // Mesai 09:00-18:00 ise sessiz pencere 18:00-09:00.
  return { start: workHoursEnd, end: workHoursStart };
}
