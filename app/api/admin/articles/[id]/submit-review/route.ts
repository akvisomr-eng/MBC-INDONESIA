import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/server";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({ note: z.string().trim().max(1000).optional() });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  if (!user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  const sql = getSql();
  if (!sql) return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "ID naskah tidak valid." }, { status: 400 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Catatan tidak valid." }, { status: 400 });
  try {
    const rows = await sql`
      WITH changed AS (
        UPDATE public.newsroom_articles
        SET status = 'in_review', updated_at = NOW(), updated_by = ${user.email}
        WHERE id = ${id}::uuid AND status IN ('draft', 'rejected')
        RETURNING id, title, slug, status
      ), review_log AS (
        INSERT INTO public.newsroom_review_events (article_id, actor_id, action, note)
        SELECT id, ${user.email}, 'submitted', ${parsed.data.note || "Diajukan untuk review editorial"}
        FROM changed RETURNING id
      ), security_log AS (
        INSERT INTO public.security_audit_events (actor_id, action, resource_type, resource_id, outcome, metadata)
        SELECT ${user.email}, 'article.submitted', 'newsroom_article', id::text, 'success', jsonb_build_object('status', status)
        FROM changed RETURNING id
      )
      SELECT id, title, slug, status FROM changed
    `;
    if (!rows.length) return NextResponse.json({ error: "Naskah tidak ditemukan atau statusnya tidak dapat diajukan." }, { status: 409 });
    return NextResponse.json({ article: rows[0] }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Pengajuan review gagal." }, { status: 503 });
  }
}