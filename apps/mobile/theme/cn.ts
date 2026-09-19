/**
 * Koşullu className birleştirici.
 *
 * ÖNEMLİ: NativeWind sınıf çakışmalarını className SIRASINA göre çözmüyor —
 * aynı CSS özelliğini (ör. `color`) hedefleyen iki sınıf verildiğinde
 * (`text-text` ve `text-danger` gibi), hangisinin kazanacağı üretilen
 * stylesheet'teki sıraya bağlı, son yazılan argümana değil. Bu yüzden bir
 * bileşenin varsayılan rengini (`text-text`/`bg-surface`/`border-border` gibi)
 * bir `className` override'ıyla (`text-danger` gibi) değiştirmeye çalışmak
 * sessizce başarısız olabiliyordu (bkz. Button primary metni — varsayılan
 * `text-text` her zaman `text-on-accent`'i eziyordu).
 *
 * Palet kapalı bir liste olduğu için (tailwind.config.js) genel bir
 * tailwind-merge yerine, aynı öneke (`bg-`/`text-`/`border-`) sahip renk
 * sınıflarından yalnızca SONUNCUSUNU tutan küçük, bu projeye özel bir
 * çözümleyici yeterli.
 */

const COLOR_TOKENS = [
  "transparent",
  "current",
  "bg",
  "surface",
  "elevated",
  "border",
  "border-strong",
  "text",
  "text-muted",
  "accent",
  "on-accent",
  "warm",
  "on-warm",
  "danger",
  "on-danger",
] as const;

const COLOR_PREFIXES = ["bg", "text", "border"] as const;

/** "bg-danger/12" → "bg" (opaklık soneki ve renk adı atılır, sadece çakışma grubu kalır). */
function colorGroupOf(cls: string): string | null {
  for (const prefix of COLOR_PREFIXES) {
    if (!cls.startsWith(`${prefix}-`)) continue;
    const rest = cls.slice(prefix.length + 1).split("/")[0];
    if ((COLOR_TOKENS as readonly string[]).includes(rest)) return prefix;
  }
  return null;
}

export function cn(...parts: (string | false | null | undefined)[]): string {
  const classes = parts.filter(Boolean).join(" ").split(/\s+/).filter(Boolean);

  const lastIndexForGroup = new Map<string, number>();
  classes.forEach((c, i) => {
    const group = colorGroupOf(c);
    if (group) lastIndexForGroup.set(group, i);
  });

  return classes
    .filter((c, i) => {
      const group = colorGroupOf(c);
      return !group || lastIndexForGroup.get(group) === i;
    })
    .join(" ");
}
