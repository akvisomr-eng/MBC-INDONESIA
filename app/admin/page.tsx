import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

const modules = [
  ["Redaksi & CMS", "Naskah, kategori, status review, dan publikasi.", "Belum diaktifkan"],
  ["Multi-agent AI", "Riset sumber, pemeriksa fakta, copy desk, dan ringkasan.", "Menunggu integrasi provider"],
  ["SEO", "Metadata, canonical, sitemap, dan audit editorial.", "Fondasi tersedia"],
  ["CRM & Iklan", "Advertiser, kampanye, dan tindak lanjut komersial.", "Menunggu modul"],
  ["Keuangan", "Jurnal, akun, rekonsiliasi, dan laporan.", "Menunggu modul"],
  ["HRD & Payroll", "Pegawai, penggajian, dan kontrol akses.", "Menunggu modul"]
];

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in?next=/admin");
  if (!user.isAdmin) {
    return <main className="auth-page"><section className="auth-card"><p className="eyebrow">AKSES TERBATAS</p><h1>Akses admin belum diberikan.</h1><p>Akun {user.email} berhasil masuk, tetapi belum tercantum pada MBC_ADMIN_EMAILS. Hubungi administrator sistem.</p><Link className="primary-link" href="/">Kembali ke portal <span>↗</span></Link></section></main>;
  }
  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        <Link className="brand" href="/"><span className="brand-mark">M</span><span>MBC <b>INDONESIA</b></span></Link>
        <nav className="admin-nav" aria-label="Navigasi dashboard">
          <a href="#overview">Ringkasan</a><a href="#modules">Modul sistem</a><Link href="/admin/articles">CMS · Naskah</Link><Link href="/api/health">Kesehatan sistem</Link><Link href="/">Portal publik</Link>
        </nav>
      </aside>
      <section className="admin-main" id="overview">
        <p className="eyebrow">ADMINISTRATOR WORKSPACE</p>
        <h1>Ruang kendali redaksi.</h1>
        <p className="admin-note">Masuk sebagai {user.name} · {user.email}</p>
        <div className="admin-grid">
          <div className="admin-metric"><span>Portal publik</span><strong>Fondasi</strong><span>Beranda + artikel publik</span></div>
          <div className="admin-metric"><span>Editorial AI</span><strong>Nonaktif</strong><span>Menunggu provider dan guardrail</span></div>
          <div className="admin-metric"><span>Publikasi otomatis</span><strong>Dinonaktifkan</strong><span>Persetujuan editor tetap wajib</span></div>
        </div>
        <div className="admin-panel" id="modules"><p className="eyebrow">PETA MODUL</p><h2>Kapabilitas platform</h2><div className="channel-grid">{modules.map(([title, description, status], index) => <article className="channel-card" key={title}><span className="channel-number">0{index+1}</span><h3>{title}</h3><p>{description}</p><p className="admin-note">{status}</p></article>)}</div></div>
        <div className="admin-panel"><h2>Kontrol keamanan</h2><p className="admin-note">Halaman ini dibatasi ke email pada MBC_ADMIN_EMAILS. Endpoint tulis CMS belum tersedia; agen AI belum aktif dan tidak dapat menerbitkan berita. Konfigurasikan DATABASE_URL, NEON_AUTH_BASE_URL, NEON_AUTH_COOKIE_SECRET, dan MBC_ADMIN_EMAILS pada environment deployment sebelum menguji akses.</p></div>
      </section>
    </main>
  );
}