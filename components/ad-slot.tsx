import Link from "next/link";

type Props = { placement: "homepage" | "article" | "sidebar" };

const copy = {
  homepage: { label: "RUANG IKLAN MBC", title: "Jangkau pembaca MBC Indonesia", detail: "Tempat untuk kampanye brand, layanan, dan informasi bersponsor yang lolos pemeriksaan redaksi." },
  article: { label: "IKLAN · KONTEN BERSponsor", title: "Promosikan layanan Anda kepada pembaca", detail: "Slot iklan tersedia. Materi akan ditinjau dan konten berbayar diberi label yang jelas." },
  sidebar: { label: "RUANG IKLAN", title: "Pasang iklan di MBC", detail: "Tanyakan posisi, format, jadwal, dan tarif resmi kepada tim pemasaran." }
};

export default function AdSlot({ placement }: Props) {
  const item = copy[placement];
  return (
    <aside className={`ad-slot ad-slot-${placement}`} aria-label="Slot iklan">
      <div className="ad-slot-meta"><span>{item.label}</span><span>BERSIFAT PROMOSI</span></div>
      <div className="ad-slot-body"><div><p className="ad-slot-kicker">MITRA KOMERSIAL MBC INDONESIA</p><h2>{item.title}</h2><p>{item.detail}</p></div>
        <Link href="https://wa.me/6282137369607?text=Halo%20MBC%20Indonesia%2C%20saya%20ingin%20menanyakan%20slot%20iklan." className="ad-slot-cta">Tanyakan slot iklan ↗</Link>
      </div>
      <small className="ad-slot-disclaimer">Slot promosi MBC. Bukan berita redaksional atau dukungan terhadap produk.</small>
    </aside>
  );
}
