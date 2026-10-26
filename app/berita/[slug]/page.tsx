import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getSql } from "@/lib/db";

type Article = {
  id: string; title: string; slug: string; dek: string | null; body_markdown: string;
  author_name: string | null; published_at: string | null; updated_at: string;
  seo_title: string | null; seo_description: string | null; canonical_url: string | null;
  featured_image_url: string | null; category_name: string | null;
};

async function getArticle(slug: string): Promise<Article | null> {
  const sql = getSql();
  if (!sql) return null;
  try {
    const rows = await sql`
      SELECT a.id, a.title, a.slug, a.dek, a.body_markdown, a.author_name,
             a.published_at, a.updated_at, a.seo_title, a.seo_description,
             a.canonical_url, a.featured_image_url, c.name AS category_name
      FROM public.newsroom_articles a
      LEFT JOIN public.newsroom_categories c ON c.id = a.category_id
      WHERE a.slug = ${slug} AND a.status = 'published' AND a.published_at <= NOW()
      LIMIT 1
    `;
    return (rows[0] as Article | undefined) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Berita tidak ditemukan", robots: { index: false, follow: false } };
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.mbcindonesia.id").replace(/\/$/, "");
  const canonical = article.canonical_url || `${base}/berita/${encodeURIComponent(article.slug)}`;
  const title = article.seo_title || article.title;
  const description = article.seo_description || article.dek || "Baca laporan dan perspektif terbaru dari MBC Indonesia.";
  return {
    title, description, alternates: { canonical },
    openGraph: { type: "article", title, description, url: canonical, publishedTime: article.published_at || undefined, authors: article.author_name ? [article.author_name] : undefined, images: article.featured_image_url ? [article.featured_image_url] : undefined },
    twitter: { card: article.featured_image_url ? "summary_large_image" : "summary", title, description, images: article.featured_image_url ? [article.featured_image_url] : undefined }
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.mbcindonesia.id").replace(/\/$/, "");
  const canonical = article.canonical_url || `${base}/berita/${encodeURIComponent(article.slug)}`;
  const schema = {
    "@context": "https://schema.org", "@type": "NewsArticle", headline: article.title,
    description: article.seo_description || article.dek || undefined, mainEntityOfPage: canonical,
    datePublished: article.published_at || undefined, dateModified: article.updated_at,
    author: article.author_name ? { "@type": "Person", name: article.author_name } : { "@type": "Organization", name: "Redaksi MBC Indonesia" },
    publisher: { "@type": "Organization", name: "MBC Indonesia", url: base },
    image: article.featured_image_url ? [article.featured_image_url] : undefined
  };
  const paragraphs = article.body_markdown.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return (
    <main className="article-shell">
      <header className="article-header"><Link href="/" className="brand"><span className="brand-mark">M</span><span>MBC <b>INDONESIA</b></span></Link><Link href="/">← Kembali ke beranda</Link></header>
      <article className="article">
        <p className="eyebrow">{article.category_name || "BERITA"} · MBC INDONESIA</p>
        <h1>{article.title}</h1>
        {article.dek ? <p className="article-dek">{article.dek}</p> : null}
        <div className="article-meta">{article.author_name ? <span>Oleh {article.author_name}</span> : <span>Redaksi MBC Indonesia</span>}{article.published_at ? <time dateTime={article.published_at}>{new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" }).format(new Date(article.published_at))}</time> : null}</div>
        {article.featured_image_url ? <Image className="article-image" src={article.featured_image_url} alt={article.title} width={1600} height={900} unoptimized /> : null}
        <div className="article-body">{paragraphs.map((p, i) => <p key={i}>{p.replace(/^#+\s*/, "")}</p>)}</div>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <footer className="site-footer"><span>MBC INDONESIA</span><span>Informasi yang jernih. Perspektif yang berarti.</span></footer>
    </main>
  );
}