const { spacing, radius, fontFamily, typeScale, touchTarget } = require("./theme/tokens.ts");

/** Semantik token → CSS değişkeni. Ekranlarda ham hex kullanılmaz. */
const color = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  // Koyu tema uygulama varsayılanı olduğu için sistem tercihine değil,
  // açıkça ayarlanan color scheme'e bağlıyoruz (theme/theme-store.ts).
  darkMode: "class",
  theme: {
    // Palet bilinçli olarak KAPALI liste: ekranlarda bg-red-500 gibi rastgele
    // renk kullanılamasın, her renk bir token üzerinden geçsin.
    colors: {
      transparent: "transparent",
      current: "currentColor",
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
