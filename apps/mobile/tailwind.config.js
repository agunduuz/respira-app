/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Tasarım token'ları (renk paleti, tipografi ölçeği) docs/01-TASARIM-SISTEMI.md
  // uygulanırken burada theme.extend altında tanımlanacak.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
