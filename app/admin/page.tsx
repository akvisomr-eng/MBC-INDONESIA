import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

type RoleRow = { role: string };
type Counts = { drafts: string; review: string; published: string; agentRuns: string };

const roleNames: Record<string, string> = {
  admin: "Administrator", editor: "Editor", reporter: "Reporter", seo: "SEO",
  finance: "Finance", hr: "HR & Payroll", advertising: "Advertising", read_only: "Read-only"
};

async function getCounts(): Promise<Counts | null> {
  const pool = getPool();
  if (!pool) return null;
  try {
    const result = await pool.query<Counts>(`SELECT
      (SELECT count(*)::text FROM public.newsroom_articles WHERE status='draft') AS drafts,
      (SELECT count(*)::text FROM public.newsroom_articles WHERE status='in_review') AS review,
      (SELECT count(*)::text FROM public.newsroom_articles WHERE status='published') AS published,
      (SELECT count(*)::text FROM public.ai_agent_runs) AS "agentRuns"`);
    return result.rows[0] ?? null;
  } catch { return null; }
}

export default async function AdminPage() {
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/auth/sign-in");

  const pool = getPool();
  if (!pool) {
    return <main id="konten" className="admin-page"><section className="admin-panel"><p className="eyebrow">MBC WORKSPACE</p><h1>Konfigurasi belum lengkap</h1><p>Database belum terhubung. Hubungi administrator sistem.</p></section></main>;
  }

  let roles: RoleRow[] = [];
  try {
    const result = await pool.query<RoleRow>(
      "SELECT role FROM public.app_user_roles WHERE lower(email)=lower($1) AND user_id=$2 ORDER BY role",
      [data.user.email, data.user.id]
    );
    roles = result.rows;
  } catch {
    return <main id="konten" className="admin-page"><section className="admin-panel"><p className="eyebrow">MBC WORKSPACE</p><h1>Role belum siap</h1><p>Fondasi RBAC belum diterapkan pada database preview. Tidak ada akses redaksi yang diberikan secara otomatis.</p></section></main>;
  }

  if (roles.length === 0) {
    return <main id="konten" className="admin-page"><section className="admin-panel"><p className="eyebrow">AKUN TERAUTENTIKASI · AKSES TERBATAS</p><h1>Akses redaksi belum diberikan</h1><p>Akun {data.user.email} berhasil dikenali, tetapi belum memiliki role MBC. Administrator harus memberikan role secara eksplisit sebelum dashboard dapat digunakan.</p><Link className="back-link" href="/">Kembali ke portal</Link></section></main>;
  }

  const counts = roles.some((r) => r.role === "admin" || r.role === "editor") ? await getCounts() : null;
  return (
    <main id="konten" className="admin-page">
      <header className="admin-header"><div><p className="eyebrow">MBC INDONESIA · WORKSPACE</p><h1>Dashboard redaksi</h1><p className="admin-welcome">Masuk sebagai {data.user.email}</p></div><div className="role-list">{roles.map((r) => <span key={r.role}>{roleNames[r.role] || r.role}</span>)}</div></header>
      {counts && <section className="admin-stats" aria-label="Ringkasan newsroom">
        <div><span>Draft</span><strong>{counts.drafts}</strong></div><div><span>Menunggu review</span><strong>{counts.review}</strong></div><div><span>Berita terbit</span><strong>{counts.published}</strong></div><div><span>Riwayat agen AI</span><strong>{counts.agentRuns}</strong></div>
      </section>}
      <section className="admin-module-grid">
        <article><span className="module-number">01</span><h2>CMS & Newsroom</h2><p>Naskah, kategori, penugasan, dan alur review editorial.</p><span className="module-status">Fondasi tersedia · alur tulis berikutnya</span></article>
        <article><span className="module-number">02</span><h2>SEO & Verifikasi</h2><p>Metadata, audit teknis, bukti sumber, dan pemeriksaan fakta.</p><span className="module-status">Menunggu integrasi modul</span></article>
        <article><span className="module-number">03</span><h2>AI Control Center</h2><p>Registry agen, kebijakan, anggaran, dan audit penggunaan.</p><span className="module-status">Nonaktif sampai provider diverifikasi</span></article>
        <article><span className="module-number">04</span><h2>Operasional bisnis</h2><p>CRM iklan, akuntansi, HRD, dan payroll dengan pemisahan akses.</p><span className="module-status">Menunggu modul dan pengujian</span></article>
      </section>
      <p className="admin-safety">Tindakan publikasi, perubahan data sensitif, dan posting keuangan harus melalui otorisasi server serta persetujuan manusia.</p>
    </main>
  );
}
