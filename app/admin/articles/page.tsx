"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

type Article = { id: string; title: string; slug: string; dek: string | null; status: string; category_name: string | null; updated_at: string };
const statuses: Record<string, string> = { draft: "Draft", in_review: "Dalam review", approved: "Disetujui", scheduled: "Terjadwal", published: "Terbit", rejected: "Perlu revisi", archived: "Arsip" };

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [dek, setDek] = useState("");
  const [body, setBody] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/articles", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Daftar naskah tidak dapat dimuat.");
    setArticles(data.articles || []);
  }, []);

  useEffect(() => { load().catch((e) => setError(e.message)); }, [load]);

  async function createDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/articles", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug: slug || undefined, dek: dek || null, body_markdown: body, source_url: sourceUrl || null, seo_title: seoTitle || null, seo_description: seoDescription || null })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Draft gagal disimpan.");
      setMessage(`Draft “${data.article.title}” berhasil disimpan.`);
      setTitle(""); setSlug(""); setDek(""); setBody(""); setSourceUrl(""); setSeoTitle(""); setSeoDescription("");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Terjadi kesalahan."); }
    finally { setBusy(false); }
  }

  async function submitReview(id: string) {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/admin/articles/${id}/submit-review`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal mengajukan review.");
      setMessage("Naskah diajukan ke antrean review editorial; naskah tidak diterbitkan otomatis.");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Terjadi kesalahan."); }
    finally { setBusy(false); }
  }

  return <main className="admin-layout"><aside className="admin-sidebar"><Link className="brand" href="/admin"><span className="brand-mark">M</span><span>MBC <b>INDONESIA</b></span></Link><nav className="admin-nav"><Link href="/admin">Ringkasan</Link><Link href="/admin/articles">CMS · Naskah</Link><Link href="/">Portal publik</Link></nav></aside><section className="admin-main"><p className="eyebrow">CONTENT MANAGEMENT SYSTEM</p><h1>Ruang kerja naskah.</h1><p className="admin-note">Buat draft, lengkapi sumber dan metadata SEO, lalu ajukan ke antrean review. Tombol ini tidak menerbitkan berita.</p>
    {message ? <p role="status">{message}</p> : null}{error ? <p className="auth-error" role="alert">{error}</p> : null}
    <div className="admin-panel"><h2>Buat draft baru</h2><form className="auth-form" onSubmit={createDraft}><label>Judul naskah<input required minLength={5} maxLength={220} value={title} onChange={(e) => setTitle(e.target.value)} /></label><label>Slug (opsional)<input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="judul-berita" /></label><label>Ringkasan / dek<input maxLength={500} value={dek} onChange={(e) => setDek(e.target.value)} /></label><label>Isi naskah (Markdown sederhana)<textarea rows={9} value={body} onChange={(e) => setBody(e.target.value)} /></label><label>URL sumber utama<input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://" /></label><label>SEO title<input maxLength={220} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} /></label><label>SEO description<textarea rows={3} maxLength={320} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} /></label><button disabled={busy}>{busy ? "Menyimpan…" : "Simpan sebagai draft"}</button></form></div>
    <div className="admin-panel"><h2>Daftar naskah</h2>{articles.length === 0 ? <p className="admin-note">Belum ada naskah atau database belum terhubung.</p> : <div className="article-list">{articles.map((article) => <article className="article-row" key={article.id}><div><span className="channel-number">{statuses[article.status] || article.status}</span><h3>{article.title}</h3><p className="admin-note">/{article.slug} · {article.category_name || "Tanpa kategori"} · Diperbarui {new Date(article.updated_at).toLocaleDateString("id-ID")}</p></div>{["draft","rejected"].includes(article.status) ? <button className="secondary-action" disabled={busy} onClick={() => submitReview(article.id)}>Ajukan review</button> : null}</article>)}</div>}</div>
  </section></main>;
}