import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = { role: "assistant" | "user"; text: string };
type ArticleContext = { title?: string; dek?: string | null; body?: string; sourceUrl?: string | null; category?: string | null };

function safeText(value: unknown, max = 6000): string {
  return typeof value === "string" ? value.slice(0, max) : "";
}

function fallbackAnswer(message: string, article?: ArticleContext): string {
  const question = message.toLowerCase();
  const title = safeText(article?.title, 300);
  const dek = safeText(article?.dek, 1000);
  const source = safeText(article?.sourceUrl, 500);
  if (/ringkas|rangkuman|summary/.test(question)) {
    return article ? `Ringkasan awal berdasarkan konteks halaman:\n\n${title}\n${dek || "Ringkasan editorial belum tersedia."}\n\nIni bukan verifikasi independen. Cocokkan nama, tanggal, angka, kutipan, dan pernyataan penting dengan dokumen atau narasumber primer.` : "Pilih artikel yang ingin diringkas terlebih dahulu. Saya dapat membantu menjelaskan isi halaman yang sedang Anda baca.";
  }
  if (/sumber|referensi|tautan|link/.test(question)) {
    return source ? `Tautan sumber yang disertakan pada halaman ini: ${source}\n\nTautan sumber tidak otomatis membuktikan semua klaim benar. Periksa penerbit, tanggal, konteks, dan sumber primer yang dirujuk.` : "Belum ada tautan sumber artikel yang tersedia dalam konteks ini. Cari dokumen primer, pernyataan resmi, data asli, dan konfirmasi independen sebelum menyimpulkan.";
  }
  if (/cek fakta|verifikasi|benar|hoaks|valid/.test(question)) {
    return "Untuk memeriksa klaim, pecah berita menjadi klaim yang dapat diuji; telusuri dokumen atau data primer; cari konfirmasi independen yang tidak hanya mengutip satu sumber; cocokkan waktu, lokasi, angka, dan konteks; lalu catat bagian yang belum terverifikasi. Saya belum menjalankan pencarian internet langsung dalam sesi ini, jadi saya tidak akan menyatakan klaim sebagai benar atau salah tanpa bukti.";
  }
  if (/konteks|maksud|arti|jelaskan/.test(question) && article) {
    return `Konteks yang tersedia di halaman ini:\nJudul: ${title}\nPokok bahasan: ${dek || "Belum ada ringkasan."}\nKategori: ${safeText(article.category || "Berita")}\n\nUntuk memahami dampaknya, bandingkan dengan sumber primer, tanggal kejadian, pihak yang terlibat, dan tanggapan pihak terkait. Informasi yang belum tersedia tidak boleh dianggap sebagai fakta.`;
  }
  return article
    ? `Saya bisa membantu membahas “${title}”. Untuk menjaga akurasi, saya hanya akan membedakan informasi yang tersedia di halaman dari hal yang masih perlu dicek. Coba pilih “Ringkas berita”, “Jelaskan konteks”, atau “Cek fakta”.`
    : "Saya siap membantu Anda memahami berita MBC. Pilih ringkasan, konteks, atau cek fakta. Untuk pertanyaan yang memerlukan data terbaru, jawaban harus ditopang pencarian sumber dan verifikasi yang dapat ditelusuri.";
}

export async function POST(request: Request) {
  let payload: { message?: unknown; article?: ArticleContext; history?: ChatMessage[] };
  try { payload = await request.json(); } catch { return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 }); }
  const message = safeText(payload.message, 1500).trim();
  if (!message) return NextResponse.json({ error: "Tulis pertanyaan terlebih dahulu." }, { status: 400 });
  const article = payload.article && typeof payload.article === "object" ? payload.article : undefined;
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;
  const baseUrl = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");

  if (apiKey && model) {
    try {
      const history = Array.isArray(payload.history) ? payload.history.slice(-8) : [];
      const context = article ? `Artikel yang sedang dibaca:\nJudul: ${safeText(article.title, 300)}\nRingkasan: ${safeText(article.dek, 1200)}\nIsi yang tersedia: ${safeText(article.body, 6000)}\nURL sumber: ${safeText(article.sourceUrl, 500)}` : "Tidak ada artikel spesifik yang dipilih.";
      const upstream = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          temperature: 0.35,
          max_tokens: 650,
          messages: [
            { role: "system", content: `Anda adalah Companion MBC Indonesia: ramah, proaktif, sopan, jelas, dan tidak memaksa. Bantu pembaca memahami berita. Bedakan fakta, klaim, analisis, dan ketidakpastian. Jangan mengarang sumber, kutipan, angka, atau hasil pencarian. Jangan mengaku sudah memverifikasi jika tidak ada bukti. Jangan memberi kesimpulan hukum atau medis yang pasti. Dorong pembaca melihat sumber primer dan menyampaikan koreksi secara santun. AI tidak menentukan publikasi berita. Konteks: \n${context}` },
            ...history.map((item) => ({ role: item.role, content: safeText(item.text, 2000) })),
            { role: "user", content: message }
          ]
        }),
        signal: AbortSignal.timeout(12000)
      });
      if (!upstream.ok) throw new Error("AI provider unavailable");
      const data = await upstream.json();
      const answer = data?.choices?.[0]?.message?.content;
      if (typeof answer === "string" && answer.trim()) return NextResponse.json({ answer: answer.slice(0, 6000), mode: "live" });
    } catch {
      // The transparent local fallback keeps the companion usable when provider is down.
    }
  }
  return NextResponse.json({ answer: fallbackAnswer(message, article), mode: "basic" });
}
