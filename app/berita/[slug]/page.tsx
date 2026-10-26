import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

type Article = {
  title: string; slug: string; dek: string | null; body_markdown: string;
  author_name: string | null; category: string | null; published_at: string | null;
  seo_title: string | null; seo_description: string | null; canonical_url: string | null;
};

async function getArticle(slug: string): Promise<Article | null> {
  const pool = getPool();
  if (!pool) return null;
  const result = await pool.query<Article>(
    `SELECT a.title, a.slug, a.dek, a.body_markdown, a.author_name,
            c.name AS category, a.published_at, a.seo_title, a.seo_description, a.canonical_url
       FROM public.newsroom_articles a
       LEFT JOIN public.newsroom_categories c ON c.id = a.category_id
      WHERE a.slug = $1 AND a.status = 'published'
        AND (a.published_at IS NULL OR a.published_at <= NOW())
      LIMIT 1`,
    [slug]
  );
  return result.rows[0] ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Berita tidak ditemukan", robots: { index: false, follow: false } };
  return {
    title: article.seo_title || article.title,
    description: article.seo_description || article.dek || undefined,
    alternates: article.canonical_url ? { canonical: article.canonical_url } : undefined,
    openGraph: { type: "article", title: article.seo_title || article.title, description: article.seo_description || article.dek || undefined, publishedTime: article.published_at || undefined }
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();
  return (
    <main id="konten" className="article-page">
      <p className="eyebrow"><Link href="/">MBC INDONESIA</Link> / {article.category || "BERITA"}</p>
      <article className="story">
        <Link href="/" className="back-link">← Kembali ke beranda</Link>
        <h1>{article.title}</h1>
        {article.dek && <p className="story-dek">{article.dek}</p>}
        <p className="story-meta">{article.author_name ? `Oleh ${article.author_name}` : "Redaksi MBC Indonesia"}{article.published_at ? ` · ${new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(new Date(article.published_at))}` : ""}</p>
        <div className="story-body">{article.body_markdown.split(/\n{2,}/).filter(Boolean).map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div>
        <p className="story-disclaimer">Naskah ini diterbitkan melalui proses editorial MBC Indonesia.</p>
      </article>
    </main>
  );
}
