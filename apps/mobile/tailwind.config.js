const { spacing, radius, fontFamily, typeScale, touchTarget } = require("./theme/tokens.ts");

/** Semantik token → CSS değişkeni. Ekranlarda ham hex kullanılmaz. */
const color = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  // Lavanta Blok yalnızca açık tema; koyu tema tasarıma girince burası yeniden açılır.
  darkMode: "class",
  theme: {
    // Palet bilinçli olarak KAPALI liste: ekranlarda bg-red-500 gibi rastgele
    // renk kullanılamasın, her renk bir token üzerinden geçsin.
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "#FFFFFF",
      // Lavanta Blok ton ölçeği — değerler çalışma zamanında hue'dan üretilir
      // (theme/tones.ts → ThemeRoot). Ekranlarda yine ham hex yok.
      t25: color("t25"),
      t50: color("t50"),
      t100: color("t100"),
      t200: color("t200"),
      t300: color("t300"),
      t400: color("t400"),
      t500: color("t500"),
      t600: color("t600"),
      t700: color("t700"),
      t800: color("t800"),
      t900: color("t900"),
      mut: color("mut"),
      "mut-l": color("mut-l"),
      line: color("line"),
      "line-2": color("line-2"),
      // Semantik takma adlar (eski ekranlar) — tonlara eşlenir.
      bg: color("bg"),
      surface: color("surface"),
      elevated: color("elevated"),
      border: color("border"),
      "border-strong": color("border-strong"),
      text: color("text"),
      "text-muted": color("text-muted"),
      accent: color("accent"),
      "on-accent": color("on-accent"),
      warm: color("warm"),
      "on-warm": color("on-warm"),
      danger: color("danger"),
      "on-danger": color("on-danger"),
    },
    extend: {
      spacing: Object.fromEntries(Object.entries(spacing).map(([k, v]) => [k, `${v}px`])),
      borderRadius: Object.fromEntries(Object.entries(radius).map(([k, v]) => [k, `${v}px`])),
      fontFamily: Object.fromEntries(Object.entries(fontFamily).map(([k, v]) => [k, [v]])),
      fontSize: Object.fromEntries(
        Object.entries(typeScale).map(([k, v]) => [
          k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`),
          [`${v.fontSize}px`, { lineHeight: `${v.lineHeight}px` }],
        ])
      ),
      minWidth: { touch: `${touchTarget.min}px` },
      minHeight: { touch: `${touchTarget.min}px` },
    },
  },
  plugins: [],
};
