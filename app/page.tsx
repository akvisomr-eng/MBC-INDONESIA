import Link from "next/link";
import Image from "next/image";
import { getSql } from "@/lib/db";

type NewsItem = {
  id: string; title: string; slug: string; dek: string | null;
  featured_image_url: string | null; author_name: string | null;
  published_at: string | null; category_name: string | null;
};

async function getLatestArticles(): Promise<NewsItem[]> {
  const sql = getSql();
  if (!sql) return [];
  try {
    return await sql`
      SELECT a.id, a.title, a.slug, a.dek, a.featured_image_url, a.author_name,
             a.published_at, c.name AS category_name
      FROM public.newsroom_articles a
      LEFT JOIN public.newsroom_categories c ON c.id = a.category_id
      WHERE a.status = 'published' AND a.published_at <= NOW()
      ORDER BY a.published_at DESC LIMIT 6
    ` as NewsItem[];
  } catch {
    return [];
  }
}

const areas = [
  ["Berita", "Informasi aktual dan perkembangan terbaru"],
  ["Nasional", "Kebijakan, peristiwa, dan isu kebangsaan"],
  ["Daerah", "Laporan dari berbagai wilayah Indonesia"],
  ["Politik", "Dinamika pemerintahan dan demokrasi"],
  ["Hukum", "Penegakan hukum dan keadilan"],
  ["Kriminal", "Peristiwa kriminal dengan konteks dan verifikasi"],
  ["Ekonomi", "Bisnis, pasar, dan penghidupan"],
  ["Olahraga", "Kompetisi, atlet, dan prestasi"],
  ["Otomotif", "Industri kendaraan dan mobilitas"],
  ["Teknologi", "Inovasi dan dampaknya bagi masyarakat"]
];

export default async function HomePage() {
  const articles = await getLatestArticles();
  return (
    <main>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="MBC Indonesia beranda"><span className="brand-mark">M</span><span>MBC <b>INDONESIA</b></span></Link>
        <nav aria-label="Navigasi utama"><a href="#berita-terbaru">Berita terbaru</a><a href="#kanal">Kanal</a><a href="#redaksi">Redaksi</a><Link href="/api/health">Status sistem</Link></nav>
      </header>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">MERDEKA BANGSA CYBERMEDIA</p>
          <h1>Menyampaikan fakta.<br/><em>Menjaga integritas.</em></h1>
          <p className="hero-intro">MBC Indonesia menyajikan berita, laporan, dan perspektif dengan mengutamakan verifikasi, konteks, dan tanggung jawab jurnalistik.</p>
          <a className="primary-link" href="#berita-terbaru">Baca berita terbaru <span aria-hidden="true">↗</span></a>
        </div>
        <div className="hero-art" aria-label="Identitas visual MBC Indonesia" role="img"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="art-core">MBC<span>INDONESIA</span></div><div className="art-caption">MENYAMPAIKAN FAKTA<br/>MENJAGA INTEGRITAS</div></div>
      </section>
      <section className="section news-feed" id="berita-terbaru">
        <div className="section-heading"><div><p className="eyebrow">TERKINI</p><h2>Berita terbaru</h2></div><p>Menyampaikan Fakta, Menjaga Integritas, Membangun Indonesia.</p></div>
        {articles.length ? <div className="news-grid">{articles.map((article) => <Link className="news-card" href={`/berita/${encodeURIComponent(article.slug)}`} key={article.id}>
          {article.featured_image_url ? <Image className="news-image" src={article.featured_image_url} alt={article.title} width={800} height={450} unoptimized /> : <div className="news-image-placeholder">MBC INDONESIA</div>}
          <div className="news-card-copy"><p className="eyebrow">{article.category_name || "Berita"}</p><h3>{article.title}</h3>{article.dek ? <p>{article.dek}</p> : null}<div className="news-meta"><span>{article.author_name || "Redaksi MBC Indonesia"}</span>{article.published_at ? <time dateTime={article.published_at}>{new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(article.published_at))}</time> : null}</div></div>
        </Link>)}</div> : <div className="empty-news"><h3>Berita segera ditampilkan di sini.</h3><p>Portal akan menampilkan artikel yang sudah diterbitkan dan disetujui redaksi setelah koneksi database dikonfigurasi.</p></div>}
      </section>
      <section className="section" id="kanal">
        <div className="section-heading"><div><p className="eyebrow">JELAJAHI</p><h2>Ruang informasi</h2></div><p>Setiap berita harus punya sumber, konteks, dan penanggung jawab yang jelas.</p></div>
        <div className="channel-grid">{areas.map(([name, desc], i) => <article className="channel-card" key={name}><span className="channel-number">{String(i+1).padStart(2,"0")}</span><h3>{name}</h3><p>{desc}</p><span className="card-arrow" aria-hidden="true">↗</span></article>)}</div>
      </section>
      <section className="editorial-band" id="redaksi"><p className="eyebrow">STANDAR REDAKSI</p><h2>AI membantu proses.<br/><em>Editor memegang keputusan.</em></h2><p>Riset berbantuan AI, pemeriksaan sumber, dan rekomendasi SEO dirancang sebagai alat kerja redaksi—bukan pengganti verifikasi manusia.</p></section>
      <footer className="site-footer"><Link className="brand" href="/"><span className="brand-mark">M</span><span>MBC <b>INDONESIA</b></span></Link><p>Menyampaikan Fakta, Menjaga Integritas, Membangun Indonesia.</p><span>© {new Date().getFullYear()} MBC Indonesia</span></footer>
    </main>
  );
}