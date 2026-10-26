import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mbcindonesia.id";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "MBC Indonesia — Berita dan Perspektif", template: "%s | MBC Indonesia" },
  description: "Portal berita MBC Indonesia. Informasi, laporan, dan perspektif yang terverifikasi.",
  robots: process.env.VERCEL_ENV === "production" ? { index: true, follow: true } : { index: false, follow: false }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}