/**
 * Bildirim zamanlamasının saf mantığı — expo bağımlılığı yok, bu yüzden
 * doğrudan test edilebilir. Platform tarafı lib/notifications.ts içinde.
 * docs/08-BILDIRIM-MIMARISI.md → Sessiz Saatler
 */

export interface QuietHours {
  /** "22:00" */
  start: string;
  /** "08:00" */
  end: string;
}

export const DEFAULT_QUIET_HOURS: QuietHours = { start: "22:00", end: "08:00" };

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Verilen an sessiz pencerede mi?
 * Pencere gece yarısını geçebilir (22:00-08:00), o yüzden iki durum var.
 */
export function isQuiet(date: Date, quiet: QuietHours): boolean {
  const minutes = date.getHours() * 60 + date.getMinutes();
  const start = toMinutes(quiet.start);
  const end = toMinutes(quiet.end);

  if (start === end) return false; // sıfır uzunlukta pencere = sessiz saat yok
  if (start < end) return minutes >= start && minutes < end;
  return minutes >= start || minutes < end; // gece yarısını aşan pencere
}

/**
 * Şu andan itibaren, sessiz saatleri atlayarak `intervalSeconds` aralıklı
 * tetikleme zamanlarını üretir.
 */
export function computeTriggerTimes(params: {
  from: Date;
  intervalSeconds: number;
  count: number;
  quietHours?: QuietHours | null;
}): Date[] {
  const { from, intervalSeconds, count, quietHours } = params;
  const times: Date[] = [];

  let cursor = from.getTime();
  // Sonsuz döngü koruması: pencere neredeyse tüm günü kaplıyorsa hiçbir aday
  // geçemeyebilir. Bir günlük denemeden sonra elde ne varsa onu döndürüyoruz —
  // hiç bildirim kurmamak, uygulamayı kilitlemekten iyidir.
  const maxAttempts = count * 4 + Math.ceil(86400 / intervalSeconds) + 10;

  for (let attempt = 0; attempt < maxAttempts && times.length < count; attempt++) {
    cursor += intervalSeconds * 1000;
    const candidate = new Date(cursor);
    if (quietHours && isQuiet(candidate, quietHours)) continue;
    times.push(candidate);
  }

  return times;
}

/**
 * Uygulama kapalıyken kaçırılan molaları bulur: geçmişte kalmış planlanmış
 * tetikleme zamanlarından, kullanıcının yanıtladığı en son andan sonrakiler.
 *
 * docs/03 → EyeStrainStatus.MISSED ("bildirime hiç yanıt verilmedi")
 */
export function findMissedTriggers(params: {
  scheduled: Date[];
  now: Date;
  /** Kullanıcının en son yanıtladığı mola anı; hiç yoksa null. */
  lastRespondedAt: Date | null;
  /** Tek seferde en fazla kaç kaçırılan mola bildirileceği. */
  cap?: number;
}): Date[] {
  const { scheduled, now, lastRespondedAt, cap = 50 } = params;
  const floor = lastRespondedAt?.getTime() ?? 0;

  return scheduled
    .filter((d) => d.getTime() <= now.getTime() && d.getTime() > floor)
    .sort((a, b) => a.getTime() - b.getTime())
    .slice(-cap);
}
