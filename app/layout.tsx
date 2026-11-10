import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZarPay — Penilaian Kredit Transparan",
  description:
    "Platform simulasi penilaian kredit dan analisis risiko pinjaman yang transparan.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
