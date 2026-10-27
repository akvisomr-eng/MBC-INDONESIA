import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SearchItem = { title?: string; url?: string; content?: string; score?: number; published_date?: string };

const searchPlans = [
  { agent: "official_sources", query: "official government statements primary data public notices Indonesia latest" },
  { agent: "independent_coverage", query: "independent news reporting Indonesia corroboration latest" },
  { agent: "open_data_research", query: "open data research reports public datasets Indonesia latest" }
];

export async function POST(request: Request) {
  const expected = process.env.EDITORIAL_RESEARCH_TOKEN;
  const authHeader = request.headers.get("authorization");
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized. Endpoint ini hanya untuk job riset redaksi yang terotorisasi." }, { status: 401 });
  }
  const key = process.env.TAVILY_API_KEY;
  if (!key) return NextResponse.json({ error: "TAVILY_API_KEY belum dikonfigurasi. Agen riset belum aktif.", status: "not_configured" }, { status: 503 });

  let topic = "berita Indonesia terbaru";
  try {
    const payload = await request.json();
    if (typeof payload?.topic === "string" && payload.topic.trim()) topic = payload.topic.trim().slice(0, 240);
  } catch { /* optional request body */ }

  const results = await Promise.all(searchPlans.map(async (plan) => {
    try {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: key, query: `${topic} ${plan.query}`, search_depth: "advanced", max_results: 5, include_answer: false, include_raw_content: false }),
        signal: AbortSignal.timeout(15000)
      });
      if (!response.ok) return { agent: plan.agent, status: "failed", candidates: [] };
      const data = await response.json();
      const candidates = (Array.isArray(data.results) ? data.results : []).map((item: SearchItem) => ({
        title: String(item.title || "").slice(0, 300),
        url: String(item.url || "").slice(0, 1200),
        snippet: String(item.content || "").slice(0, 1200),
        publishedAt: item.published_date || null,
        score: typeof item.score === "number" ? item.score : null,
        workflowStatus: "needs_editorial_and_license_review",
        licenseStatus: "not_verified"
      })).filter((item: { url: string }) => /^https?:\/\//i.test(item.url));
      return { agent: plan.agent, status: "succeeded", candidates };
    } catch {
      return { agent: plan.agent, status: "failed", candidates: [] };
    }
  }));

  return NextResponse.json({
    topic,
    generatedAt: new Date().toISOString(),
    status: results.some((item) => item.status === "succeeded") ? "research_candidates_ready" : "search_failed",
    policy: "Search results are leads only. No article, image, or media may be republished until source reliability, license, attribution, privacy, defamation risk, and editorial relevance are checked by authorized staff.",
    agents: results
  });
}
