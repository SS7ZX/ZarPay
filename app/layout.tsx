import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZarPay | Simulasi Penilaian Kredit",
  description:
    "Simulasikan cicilan dan rasio DTI, lalu pahami faktor di balik skor penilaian akademik ZarPay.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
