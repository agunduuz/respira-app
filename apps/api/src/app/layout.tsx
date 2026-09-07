import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Respira API",
  description: "Respira mobil uygulamasının backend servisi",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
