"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { agentRegistry } from "@/lib/agents/registry";

type Article = { id: string; title: string; slug: string; status: string };
type AgentResult = { runId: string; status: string; result?: { recommendation: string; costMicros: number; usage: { promptTokens: number; completionTokens: number } } };

export default function AgentsClient() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [articleId, setArticleId] = useState("");
  const [agentKey, setAgentKey] = useState(agentRegistry[0]?.key || "research_sources");
  const [result, setResult] = useState<AgentResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadArticles = useCallback(async () => {
    const response = await fetch("/api/admin/articles", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Naskah tidak dapat dimuat.");
    const eligible = (data.articles || []).filter((item: Article) => ["draft", "in_review", "rejected"].includes(item.status));
    setArticles(eligible);
    if (!articleId && eligible.length) setArticleId(eligible[0].id);
  }, [articleId]);

  useEffect(() => { loadArticles().catch((e) => setError(e.message)); }, [loadArticles]);

  async function runAgent() {
    if (!articleId) { setError("Pilih naskah yang akan dianalisis."); return; }
    setBusy(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/admin/agents/run", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, agentKey })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Run agen gagal.");
      setResult(data);
    } catch (e) { setError(e instanceof Error ? e.message : "Run agen gagal."); }
    finally { setBusy(false); }
  }

  return <main className="admin-layout"><aside className="admin-sidebar"><Link className="brand" href="/admin"><span className="brand-mark">M</span><span>MBC <b>INDONESIA</b></span></Link><nav className="admin-nav"><Link href="/admin">Ringkasan</Link><Link href="/admin/articles">CMS · Naskah</Link><Link href="/admin/agents">Multi-agent AI</Link><Link href="/">Portal publik</Link></nav></aside><section className="admin-main"><p className="eyebrow">EDITORIAL AI WORKSPACE</p><h1>Asisten untuk redaksi.</h1><p className="admin-note">Agen memberi rekomendasi untuk naskah yang belum diterbitkan. Hasil selalu berstatus perlu ditinjau; agen tidak mengubah atau menerbitkan artikel.</p>
    <div className="admin-panel"><label className="auth-form">Pilih naskah<select value={articleId} onChange={(e) => setArticleId(e.target.value)}><option value="">Pilih naskah…</option>{articles.map((article) => <option key={article.id} value={article.id}>{article.title} · {article.status}</option>)}</select></label><label className="auth-form">Pilih agen<select value={agentKey} onChange={(e) => setAgentKey(e.target.value)}>{agentRegistry.map((agent) => <option key={agent.key} value={agent.key}>{agent.label} — {agent.purpose}</option>)}</select></label><button className="agent-run-button" disabled={busy || !articleId} onClick={runAgent}>{busy ? "Menjalankan agen…" : "Jalankan analisis"}</button><p className="admin-note">Sebelum run aktif, administrator harus mengonfigurasi provider HTTPS, model, batas token, pagu biaya harian, dan tarif token. Konfigurasi yang belum lengkap akan memblokir permintaan.</p></div>
    {error ? <div className="admin-panel"><p className="auth-error" role="alert">{error}</p></div> : null}
    {result ? <div className="admin-panel"><p className="eyebrow">HASIL · PERLU REVIEW</p><h2>Rekomendasi agen</h2><p className="admin-note">Run ID: {result.runId} · Status: {result.status}</p>{result.result ? <><p className="admin-note">Penggunaan: {result.result.usage.promptTokens} input tokens · {result.result.usage.completionTokens} output tokens · estimasi biaya {result.result.costMicros} mikro-USD</p><div className="agent-output">{result.result.recommendation}</div></> : null}<p className="admin-note">Tinjau fakta, sumber, risiko hukum, privasi, dan konteks sebelum menggunakan hasil ini.</p></div> : null}
    <div className="admin-panel"><h2>Peran agen</h2><div className="channel-grid">{agentRegistry.map((agent, index) => <article className="channel-card" key={agent.key}><span className="channel-number">0{index+1}</span><h3>{agent.label}</h3><p>{agent.purpose}</p><p className="admin-note">Status default: nonaktif · Persetujuan manusia: {agent.requiresHumanApproval ? "wajib" : "tetap disarankan"}</p></article>)}</div></div>
  </section></main>;
}