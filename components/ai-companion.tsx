"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type Message = { role: "assistant" | "user"; text: string };
type ArticleContext = { title: string; dek?: string | null; body?: string; sourceUrl?: string | null; category?: string | null };
type Props = { article?: ArticleContext };

const defaultWelcome = "Halo, selamat datang di MBC Indonesia! Saya siap membantu Anda memahami berita, melihat konteks, dan menelusuri sumber. Mau mulai dari ringkasan, fakta yang perlu dicek, atau pertanyaan Anda sendiri?";

export default function AiCompanion({ article }: Props) {
  const welcome = article
    ? `Halo! Saya Companion MBC. Kita sedang membaca “${article.title}”. Saya bisa merangkum isi, menjelaskan istilah, membantu memisahkan fakta dari klaim, atau menunjukkan pertanyaan yang masih perlu diverifikasi. Keputusan editorial tetap milik redaksi.`
    : defaultWelcome;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function ask(question: string) {
    const text = question.trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user" as const, text }];
    setMessages(next);
    setDraft("");
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, article, history: next.slice(-8) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Jawaban belum dapat dimuat.");
      setMessages((current) => [...current, { role: "assistant", text: data.answer }]);
      if (data.mode !== "live") setNotice("Mode bantuan dasar aktif. Jawaban AI penuh tersedia setelah provider dikonfigurasi.");
    } catch {
      setMessages((current) => [...current, { role: "assistant", text: "Maaf, sambungan bantuan sedang bermasalah. Anda tetap bisa membaca artikel dan memeriksa tautan sumber yang tercantum. Silakan coba lagi sebentar." }]);
      setNotice("Sambungan Companion gagal.");
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(draft);
  }

  function speakLatest() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setNotice("Browser ini belum mendukung pembacaan suara.");
      return;
    }
    const latest = [...messages].reverse().find((message) => message.role === "assistant")?.text || welcome;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(latest);
    utterance.lang = "id-ID";
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="companion-root">
      {open && (
        <section className="companion-panel" aria-label="MBC AI Companion" aria-live="polite">
          <header className="companion-header">
            <span className="companion-orb" aria-hidden="true">M</span>
            <div><strong>Companion MBC</strong><small>{article ? "Pendamping artikel" : "Teman memahami berita"}</small></div>
            <button type="button" className="companion-close" aria-label="Tutup Companion" onClick={() => setOpen(false)}>×</button>
          </header>
          <div className="companion-capabilities">
            <button type="button" onClick={() => void ask("Ringkas berita ini dalam bahasa sederhana.")}>Ringkas berita</button>
            <button type="button" onClick={() => void ask("Jelaskan konteks dan istilah penting dalam berita ini.")}>Jelaskan konteks</button>
            <button type="button" onClick={() => void ask("Apa yang perlu diverifikasi dan sumber pembanding apa yang diperlukan?")}>Cek fakta</button>
          </div>
          <div className="companion-messages">
            {messages.length === 0 && <p className="companion-message assistant">{welcome}</p>}
            {messages.map((message, index) => <p key={index} className={`companion-message ${message.role}`}>{message.text}</p>)}
            {busy && <p className="companion-message assistant">Saya sedang menyusun jawaban…</p>}
          </div>
          {notice && <p className="companion-notice" role="status">{notice}</p>}
          <form className="companion-form" onSubmit={submit}>
            <label className="visually-hidden" htmlFor="companion-prompt">Tulis pertanyaan</label>
            <input id="companion-prompt" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Tanyakan apa saja tentang berita…" />
            <button type="submit" aria-label="Kirim pertanyaan" disabled={busy || !draft.trim()}>↗</button>
          </form>
          <button type="button" className="companion-speak" onClick={speakLatest}>▶ Dengarkan jawaban</button>
          <p className="companion-footnote">Pendamping informasi, bukan pengganti verifikasi redaksi. Periksa sumber dan konteks sebelum mengambil kesimpulan.</p>
        </section>
      )}
      <button type="button" className="companion-launcher" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Tutup AI Companion" : "Buka AI Companion"}>
        <span className="companion-launcher-orb" aria-hidden="true">M</span><span className="companion-launcher-label">{open ? "Tutup" : "Tanya MBC"}</span>
      </button>
    </div>
  );
}
