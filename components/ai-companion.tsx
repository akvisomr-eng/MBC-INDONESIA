"use client";

import { FormEvent, useState } from "react";

type Message = { role: "assistant" | "user"; text: string };

const welcome: Message = {
  role: "assistant",
  text: "Halo, saya Companion MBC. Saya dirancang untuk membantu membaca berita, merangkum isi, menjelaskan konteks, dan menunjukkan hal yang perlu diverifikasi. Sambungan model AI belum diaktifkan pada preview ini, jadi jawaban otomatis belum tersedia."
};

export default function AiCompanion() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((current) => [...current, { role: "user", text }]);
    setDraft("");
    setNotice("Pesan tersimpan di tampilan ini, tetapi belum dikirim ke model AI karena provider belum dikonfigurasi.");
  }

  function speakLatest() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setNotice("Browser ini belum mendukung pembacaan suara.");
      return;
    }
    const latest = [...messages].reverse().find((message) => message.role === "assistant");
    if (!latest) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(latest.text);
    utterance.lang = "id-ID";
    window.speechSynthesis.speak(utterance);
    setNotice("Pembacaan suara browser dimulai. Kualitas suara bergantung pada suara Bahasa Indonesia yang tersedia di perangkat.");
  }

  return (
    <div className="companion-root">
      {open && (
        <section className="companion-panel" aria-label="MBC AI Companion" aria-live="polite">
          <header className="companion-header">
            <span className="companion-orb" aria-hidden="true">M</span>
            <div><strong>Companion MBC</strong><small>Asisten berita · pratinjau</small></div>
            <button type="button" className="companion-close" aria-label="Tutup Companion" onClick={() => setOpen(false)}>×</button>
          </header>
          <div className="companion-capabilities">
            <span>Ringkas berita</span><span>Jelaskan konteks</span><span>Periksa sumber</span>
          </div>
          <div className="companion-messages">
            {messages.map((message, index) => (
              <p key={index} className={`companion-message ${message.role}`}>{message.text}</p>
            ))}
          </div>
          {notice && <p className="companion-notice" role="status">{notice}</p>}
          <form className="companion-form" onSubmit={submit}>
            <label className="visually-hidden" htmlFor="companion-prompt">Tulis pertanyaan</label>
            <input id="companion-prompt" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Tanyakan tentang berita…" />
            <button type="submit" aria-label="Kirim pertanyaan">↗</button>
          </form>
          <button type="button" className="companion-speak" onClick={speakLatest}>▶ Dengarkan jawaban terakhir</button>
          <p className="companion-footnote">Mode pratinjau. Model AI, memori lintas sesi, dan agen verifikasi belum diaktifkan.</p>
        </section>
      )}
      <button type="button" className="companion-launcher" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Tutup AI Companion" : "Buka AI Companion"}>
        <span className="companion-launcher-orb" aria-hidden="true">M</span><span className="companion-launcher-label">{open ? "Tutup" : "Tanya MBC"}</span>
      </button>
    </div>
  );
}
