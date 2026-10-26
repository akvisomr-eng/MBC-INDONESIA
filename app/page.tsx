import Link from "next/link";

const areas = [
  ["Nasional", "Laporan dan kebijakan publik"],
  ["Daerah", "Cerita dari berbagai wilayah"],
  ["Ekonomi", "Bisnis, pasar, dan penghidupan"],
  ["Teknologi", "Inovasi dan dampaknya"],
  ["Dunia", "Peristiwa dan perspektif global"],
  ["Opini", "Gagasan dengan konteks dan tanggung jawab"]
];

export default function HomePage() {
  return (
    <main>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="MBC Indonesia beranda"><span className="brand-mark">M</span><span>MBC <b>INDONESIA</b></span></Link>
        <nav aria-label="Navigasi utama"><a href="#kanal">Kanal</a><a href="#redaksi">Redaksi</a><Link href="/api/health">Status sistem</Link></nav>
      </header>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">MEDIA · BERITA · PERSPEKTIF</p>
          <h1>Informasi yang jernih.<br/><em>Perspektif yang berarti.</em></h1>
          <p className="hero-intro">MBC Indonesia membangun ruang berita yang mengutamakan konteks, verifikasi, dan tanggung jawab editorial.</p>
          <a className="primary-link" href="#kanal">Jelajahi kanal <span aria-hidden="true">↗</span></a>
        </div>
        <div className="hero-art" aria-label="Ilustrasi abstrak ruang redaksi" role="img"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="art-core">MBC<span>INDONESIA</span></div><div className="art-caption">JURNALISME<br/>DENGAN KONTEKS</div></div>
      </section>
      <section className="section" id="kanal">
        <div className="section-heading"><div><p className="eyebrow">JELAJAHI</p><h2>Ruang informasi</h2></div><p>Setiap berita harus punya sumber, konteks, dan penanggung jawab yang jelas.</p></div>
        <div className="channel-grid">{areas.map(([name, desc], i) => <article className="channel-card" key={name}><span className="channel-number">0{i+1}</span><h3>{name}</h3><p>{desc}</p><span className="card-arrow" aria-hidden="true">↗</span></article>)}</div>
      </section>
      <section className="editorial-band" id="redaksi"><p className="eyebrow">STANDAR REDAKSI</p><h2>AI membantu proses.<br/><em>Editor memegang keputusan.</em></h2><p>Riset berbantuan AI, pemeriksaan sumber, dan rekomendasi SEO dirancang sebagai alat kerja redaksi—bukan pengganti verifikasi manusia.</p></section>
      <footer className="site-footer"><Link className="brand" href="/"><span className="brand-mark">M</span><span>MBC <b>INDONESIA</b></span></Link><p>Jurnalisme yang bertanggung jawab.</p><span>© {new Date().getFullYear()} MBC Indonesia</span></footer>
    </main>
  );
}