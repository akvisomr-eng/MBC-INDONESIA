import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mbcindonesia.id";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MBC Indonesia — Berita dan Perspektif",
    template: "%s | MBC Indonesia"
  },
  description: "Portal berita MBC Indonesia. Informasi, laporan, dan perspektif yang mengutamakan akurasi serta tanggung jawab editorial.",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "MBC Indonesia",
    title: "MBC Indonesia — Berita dan Perspektif",
    description: "Informasi, laporan, dan perspektif dengan tanggung jawab editorial."
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <a className="skip-link" href="#konten">Lewati ke konten</a>
        {children}
        <footer className="site-footer">
          <div className="footer-inner">
            <strong>MBC INDONESIA</strong>
            <span>Informasi dengan tanggung jawab editorial.</span>
            <span>© {new Date().getFullYear()} MBC Indonesia</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
