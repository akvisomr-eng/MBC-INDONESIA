import Link from "next/link";
import { getLatestArticles, type PublicArticle } from "@/lib/db";
import { sourceArticles } from "@/lib/source-articles";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "Terbaru";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(value));
}

export default async function HomePage() {
  let articles: PublicArticle[] = [];
  let databaseAvailable = Boolean(process.env.DATABASE_URL);
  let loadFailed = false;
  try {
    articles = await getLatestArticles(12);
  } catch {
    loadFailed = true;
  }

  // Keep the three verified source stories available as local article pages until
  // the newsroom publishes database-backed records for them.
  const showingSourceArticles = articles.length === 0;
  const displayArticles: Array<PublicArticle & { location?: string; sourceUrl?: string }> =
    showingSourceArticles
      ? sourceArticles.map((article) => ({
          id: article.slug,
          title: article.title,
          slug: article.slug,
          dek: article.dek,
          category: article.category,
          author_name: article.author,
          featured_image_url: article.imageUrl,
          published_at: article.publishedAt,
          location: article.location,
          sourceUrl: article.sourceUrl
        }))
      : articles;

  return (
    <main id="konten">
      <div className="topline"><span>INDEPENDEN · AKURAT · BERTANGGUNG JAWAB</span><span>PORTAL BERITA INDONESIA</span></div>
      <header className="masthead">
        <Link href="/" className="brand" aria-label="MBC Indonesia beranda">
          <span className="brand-mark">MBC</span>
          <span className="brand-subtitle">INDONESIA</span>
        </Link>
        <p className="masthead-note">Menyajikan fakta.<br/>Merawat kepercayaan.</p>
      </header>
      <nav className="main-nav" aria-label="Navigasi utama">
        <Link href="/">Beranda</Link>
        <a href="#nasional">Nasional</a>
        <a href="#ekonomi">Ekonomi</a>
        <a href="#daerah">Daerah</a>
        <a href="#teknologi">Teknologi</a>
        <a href="#opini">Opini</a>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">MBC INDONESIA · RUANG INFORMASI PUBLIK</p>
          <h1>Berita jernih.<br/><em>Perspektif yang utuh.</em></h1>
          <p className="hero-description">Menghadirkan informasi yang kontekstual, terverifikasi, dan relevan bagi masyarakat.</p>
          <a className="text-link" href="#berita-terbaru">Jelajahi berita terbaru <span aria-hidden="true">↗</span></a>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-monogram">M<span>.</span></div><div className="hero-caption">MEDIA · BERITA · CAKRAWALA</div></div>
      </section>

      <section className="news-section" id="berita-terbaru">
        <div className="section-heading">
          <div><p className="eyebrow">DARI MEJA REDAKSI</p><h2>Berita terbaru</h2></div>
          <span className="section-rule"/>
        </div>
        {loadFailed && showingSourceArticles && <p className="source-note">Menampilkan artikel sumber yang sudah disalin ke halaman lokal. Koneksi database berita sedang perlu diperiksa.</p>}
        {displayArticles.length === 0 ? (
          <div className="empty-state"><h3>Ruang redaksi sedang bersiap</h3><p>Berita akan tampil di sini setelah naskah ditinjau, disetujui editor, dan diterbitkan. MBC tidak menampilkan berita contoh atau data yang dibuat-buat.</p>{!databaseAvailable && <p className="setup-note">Konfigurasi database belum tersedia pada environment aplikasi ini.</p>}</div>
        ) : (
          <div className="article-grid">
            {displayArticles.map((article, index) => (
              <article className={index === 0 ? "article-card article-featured" : "article-card"} key={article.id}>
                {article.featured_image_url ? <div className="article-image"><img src={article.featured_image_url} alt="" loading="lazy"/></div> : <div className="article-image image-placeholder"><span>MBC<span className="red-dot">.</span></span></div>}
                <div className="article-meta"><span>{article.category || "Berita"}</span><span>{formatDate(article.published_at)}</span>{("location" in article && article.location) && <span>{article.location}</span>}</div>
                <h3><Link href={`/berita/${article.slug}`}>{article.title}</Link></h3>
                {article.dek && <p>{article.dek}</p>}
                <span className="article-byline">{article.author_name ? `Oleh ${article.author_name}` : "Redaksi MBC Indonesia"}</span>
                <p className="article-actions"><Link className="text-link" href={`/berita/${article.slug}`}>Baca selengkapnya <span aria-hidden="true">↗</span></Link>{"sourceUrl" in article && article.sourceUrl && <> · <a className="source-link" href={article.sourceUrl} target="_blank" rel="noopener noreferrer">Sumber asli</a></>}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="editorial-note" id="opini">
        <p className="eyebrow">KOMITMEN REDAKSI</p>
        <h2>Kepercayaan dibangun melalui proses.</h2>
        <p>Setiap naskah melewati pemeriksaan redaksional. Teknologi membantu riset dan verifikasi; keputusan publikasi tetap berada pada editor yang berwenang.</p>
      </section>
    </main>
  );
}
