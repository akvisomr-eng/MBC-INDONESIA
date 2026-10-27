import Link from "next/link";
import { getLatestArticles, type PublicArticle } from "@/lib/db";
import { sourceArticles } from "@/lib/source-articles";
import AiCompanion from "@/components/ai-companion";
import ResilientImage from "@/components/resilient-image";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "Terbaru";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(value));
}

const navigationTiles = [
  { href: "#berita-terbaru", number: "01", title: "Berita", subtitle: "Laporan terbaru", className: "tile-blue" },
  { href: "#berita-terbaru", number: "02", title: "Nasional", subtitle: "Dari seluruh Indonesia", className: "tile-cyan" },
  { href: "#berita-terbaru", number: "03", title: "Daerah", subtitle: "Cerita dari wilayah", className: "tile-orange" },
  { href: "#berita-terbaru", number: "04", title: "Ekonomi", subtitle: "Bisnis dan kebijakan", className: "tile-violet" },
  { href: "#teknologi", number: "05", title: "Teknologi", subtitle: "Digital dan Web3", className: "tile-navy" },
  { href: "#companion", number: "06", title: "AI Companion", subtitle: "Baca dan pahami berita", className: "tile-red" }
];

export default async function HomePage() {
  let articles: PublicArticle[] = [];
  let databaseAvailable = Boolean(process.env.DATABASE_URL);
  let loadFailed = false;
  try {
    articles = await getLatestArticles(12);
  } catch {
    loadFailed = true;
  }

  const sourceCards: Array<PublicArticle & { location?: string; sourceUrl?: string }> =
    sourceArticles.map((article) => ({
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
    }));
  const databaseSlugs = new Set(articles.map((article) => article.slug));
  const displayArticles: Array<PublicArticle & { location?: string; sourceUrl?: string }> = [
    ...articles,
    ...sourceCards.filter((article) => !databaseSlugs.has(article.slug))
  ];
  const showingSourceArticles = sourceCards.length > 0;

  return (
    <main id="konten">
      <div className="topline"><span>INDEPENDEN · AKURAT · BERTANGGUNG JAWAB</span><span>PORTAL BERITA INDONESIA <i className="status-dot" /> EDISI DIGITAL</span></div>
      <header className="masthead">
        <Link href="/" className="brand" aria-label="MBC Indonesia beranda">
          <span className="brand-mark">MBC<span className="brand-period">.</span></span>
          <span className="brand-subtitle">INDONESIA</span>
        </Link>
        <div className="masthead-right"><p className="masthead-note">Menyajikan fakta.<br/>Merawat kepercayaan.</p><span className="edition-tag">MEDIA · BERITA · CAKRAWALA</span></div>
      </header>
      <nav className="main-nav" aria-label="Navigasi utama">
        <Link href="/">Beranda</Link>
        <a href="#berita-terbaru">Nasional</a><a href="#berita-terbaru">Ekonomi</a><a href="#berita-terbaru">Daerah</a><a href="#teknologi">Teknologi & Web3</a><a href="#opini">Opini</a>
        <a className="nav-companion" href="#companion">✳ AI Companion</a>
      </nav>

      <section className="metro-gallery-hero" aria-label="Sorotan MBC Indonesia">
        <div className="hero-gallery-heading">
          <div>
            <p className="eyebrow"><span className="eyebrow-square" /> MBC INDONESIA / SOROTAN REDAKSI</p>
            <h1>Berita yang bergerak.<br/><em>Perspektif yang terhubung.</em></h1>
          </div>
          <a className="hero-all-news" href="#berita-terbaru">Jelajahi semua berita <span aria-hidden="true">↗</span></a>
        </div>
        <div className="hero-media-grid">
          <a className="hero-media hero-media-main" href="/berita/pererat-silaturahmi-ormas-gbran-turut-hadiri-pelantikan-pac-progib-dpc-kediri" aria-label="Baca berita pelantikan PAC PROGIB di Kediri">
            <ResilientImage src="https://www.mbcindonesia.id/wp-content/uploads/2026/10/IMG-20261025-WA0022.jpg" alt="Pelantikan PAC PROGIB DPC Kediri" loading="eager" className="hero-photo" />
            <span className="hero-media-shade" />
            <span className="hero-media-label">LIPUTAN DAERAH <i /> KEDIRI</span>
            <span className="hero-media-title">Silaturahmi dan penguatan organisasi hingga akar rumput</span>
            <span className="hero-media-arrow" aria-hidden="true">↗</span>
          </a>
          <a className="hero-media hero-media-secondary" href="/berita/progib-jatim-dpc-kediri-resmi-lantik-pac-se-kabupaten-semangat-perkuat-keterlibatan-hingga-ke-akar-rumput" aria-label="Baca berita pelantikan PAC se-Kabupaten Kediri">
            <ResilientImage src="https://www.mbcindonesia.id/wp-content/uploads/2026/10/IMG-20261025-WA0021.jpg" alt="Pengurus dan peserta pelantikan PAC PROGIB" loading="eager" className="hero-photo" />
            <span className="hero-media-shade" />
            <span className="hero-media-label">NASIONAL / DAERAH</span>
            <span className="hero-media-title">Kepengurusan PAC resmi dilantik</span>
            <span className="hero-media-arrow" aria-hidden="true">↗</span>
          </a>
          <a className="hero-media hero-media-secondary" href="/berita/pots-money-resmi-hadir-di-madiun-perkenalkan-inovasi-keuangan-digital-berbasis-defi-dan-kecerdasan-buatan" aria-label="Baca laporan ekonomi digital dari Madiun">
            <ResilientImage src="https://www.mbcindonesia.id/wp-content/uploads/2026/10/IMG-20261025-WA0043.jpg" alt="Kegiatan pengenalan keuangan digital di Madiun" loading="eager" className="hero-photo" />
            <span className="hero-media-shade" />
            <span className="hero-media-label">EKONOMI DIGITAL</span>
            <span className="hero-media-title">Madiun dan perkembangan ekosistem digital</span>
            <span className="hero-media-arrow" aria-hidden="true">↗</span>
          </a>
          <a className="hero-video-card" href="https://www.youtube.com/@setyadharma" target="_blank" rel="noopener noreferrer" aria-label="Buka kanal video YouTube eksternal @setyadharma">
            <span className="hero-video-kicker">MBC / VIDEO & MULTIMEDIA</span>
            <span className="hero-video-play" aria-hidden="true">▶</span>
            <strong>Berita bukan hanya dibaca.</strong>
            <span className="hero-video-copy">Lanjutkan ke kanal video eksternal yang disebut dalam liputan Madiun.</span>
            <span className="hero-video-link">Buka kanal video <span aria-hidden="true">↗</span></span>
            <small>Video eksternal · bukan pemutar video MBC tersemat</small>
          </a>
        </div>
        <p className="hero-caption">FAKTA / KONTEKS / PUBLIK <span>Foto liputan: MBC Indonesia</span></p>
      </section>

      <section className="quick-access" aria-labelledby="quick-access-title">
        <div className="section-heading"><div><p className="eyebrow">JELAJAHI MBC</p><h2 id="quick-access-title">Satu ruang. Banyak perspektif.</h2></div><span className="section-rule"/></div>
        <div className="metro-tiles">
          {navigationTiles.map((tile) => (
            <a key={tile.number} href={tile.href} className={`metro-tile ${tile.className}`}>
              <span className="tile-number">{tile.number} / MBC</span><span className="tile-icon" aria-hidden="true">{tile.number === "06" ? "✳" : tile.number === "05" ? "⌘" : tile.number === "04" ? "↗" : tile.number === "03" ? "⌖" : tile.number === "02" ? "◎" : "▤"}</span>
              <strong>{tile.title}</strong><small>{tile.subtitle}</small><span className="tile-arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="news-section" id="berita-terbaru">
        <div className="section-heading"><div><p className="eyebrow">DARI MEJA REDAKSI</p><h2>Berita terbaru</h2></div><span className="section-rule"/></div>
        {loadFailed && showingSourceArticles && <p className="source-note">Menampilkan artikel sumber yang tersedia secara lokal. Koneksi database berita perlu diperiksa.</p>}
        {displayArticles.length === 0 ? (
          <div className="empty-state"><h3>Ruang redaksi sedang bersiap</h3><p>Berita akan tampil di sini setelah naskah ditinjau, disetujui editor, dan diterbitkan. MBC tidak menampilkan berita contoh atau data yang dibuat-buat.</p>{!databaseAvailable && <p className="setup-note">Konfigurasi database belum tersedia pada environment aplikasi ini.</p>}</div>
        ) : (
          <div className="article-grid">
            {displayArticles.map((article, index) => (
              <article className={index === 0 ? "article-card article-featured" : "article-card"} key={article.id}>
                {article.featured_image_url ? <div className="article-image"><ResilientImage src={article.featured_image_url} alt="" loading="lazy" /></div> : <div className="article-image image-placeholder"><span>MBC<span className="red-dot">.</span></span></div>}
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

      <section className="web3-section" id="teknologi">
        <div className="web3-copy"><p className="eyebrow">MBC / LAB DIGITAL</p><h2>Jurnalisme bertemu masa depan terbuka.</h2><p>MBC mengeksplorasi Web3 secara bertanggung jawab: literasi blockchain, identitas dan asal-usul konten, serta transparansi proses. Informasi finansial dan aset digital akan diperlakukan sebagai topik berisiko tinggi—bukan ajakan investasi.</p><span className="web3-status"><i className="status-dot"/> ARAH PENGEMBANGAN · BUKAN FITUR AKTIF</span></div>
        <div className="web3-cards"><div><span>01 / TRUST</span><strong>Jejak sumber</strong><small>Rujukan dan koreksi yang dapat ditelusuri.</small></div><div><span>02 / OPEN WEB</span><strong>Standar terbuka</strong><small>Prioritaskan interoperabilitas, bukan token spekulatif.</small></div><div><span>03 / SAFETY</span><strong>Manusia tetap berwenang</strong><small>Verifikasi dan publikasi tetap melalui editor.</small></div></div>
      </section>

      <section className="companion-promo" id="companion">
        <div className="companion-promo-mark">M<span>✳</span></div><div><p className="eyebrow">MBC AI COMPANION</p><h2>Jangan hanya membaca berita.<br/><em>Pahami konteksnya.</em></h2><p>Companion dirancang untuk membacakan artikel, merangkum, menjawab pertanyaan berdasarkan konteks, membandingkan klaim, dan membantu menelusuri sumber. Sistem AI aktif setelah provider, batas biaya, serta kontrol privasi dikonfigurasi.</p></div><a href="#berita-terbaru" className="text-link">Mulai dari berita <span aria-hidden="true">↗</span></a>
      </section>

      <section className="editorial-note" id="opini">
        <p className="eyebrow">KOMITMEN REDAKSI</p><h2>Kepercayaan dibangun melalui proses.</h2><p>AI membantu riset, pemeriksaan silang, aksesibilitas, dan analisis. AI tidak menerbitkan berita secara mandiri. Keputusan publikasi dan materi sensitif tetap berada pada editor yang berwenang.</p>
      </section>
      <AiCompanion />
    </main>
  );
}
