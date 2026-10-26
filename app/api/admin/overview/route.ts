import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  if (!user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  const sql = getSql();
  if (!sql) return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  try {
    const [articleCounts, agentCounts] = await Promise.all([
      sql`SELECT status, COUNT(*)::int AS count FROM public.newsroom_articles GROUP BY status`,
      sql`SELECT status, COUNT(*)::int AS count FROM public.ai_agent_runs GROUP BY status`
    ]);
    return NextResponse.json({ articles: articleCounts, agents: agentCounts, generatedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Ringkasan dashboard sementara tidak tersedia." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}