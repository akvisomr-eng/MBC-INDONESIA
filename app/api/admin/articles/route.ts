import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/server";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const articleInput = z.object({
  title: z.string().trim().min(5).max(220),
  slug: z.string().trim().max(240).optional(),
  dek: z.string().trim().max(500).optional().nullable(),
  body_markdown: z.string().max(100000).optional(),
  category_id: z.string().uuid().optional().nullable(),
  source_url: z.string().url().max(2048).optional().nullable(),
  source_attribution: z.string().trim().max(500).optional().nullable(),
  seo_title: z.string().trim().max(220).optional().nullable(),
  seo_description: z.string().trim().max(320).optional().nullable(),
  canonical_url: z.string().url().max(2048).optional().nullable(),
  featured_image_url: z.string().url().max(2048).optional().nullable(),
  is_sponsored: z.boolean().optional()
});

function slugify(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 220);
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  if (!user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  const sql = getSql();
  if (!sql) return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  try {
    const rows = await sql`
      SELECT a.id, a.title, a.slug, a.dek, a.status, a.author_name, a.updated_at,
             a.seo_title, a.seo_description, c.name AS category_name
      FROM public.newsroom_articles a
      LEFT JOIN public.newsroom_categories c ON c.id = a.category_id
      ORDER BY a.updated_at DESC LIMIT 100
    `;
    return NextResponse.json({ articles: rows }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Daftar naskah tidak tersedia." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  if (!user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  const sql = getSql();
  if (!sql) return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  const parsed = articleInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Data naskah tidak valid.", details: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;
  const slug = slugify(input.slug || input.title);
  if (!slug) return NextResponse.json({ error: "Slug tidak valid." }, { status: 400 });
  try {
    const rows = await sql`
      WITH created AS (
        INSERT INTO public.newsroom_articles
          (title, slug, dek, body_markdown, status, category_id, author_name,
           source_url, source_attribution, seo_title, seo_description, canonical_url,
           featured_image_url, is_sponsored, created_by, updated_by)
        VALUES
          (${input.title}, ${slug}, ${input.dek || null}, ${input.body_markdown || ""},
           'draft', ${input.category_id || null}, ${user.name}, ${input.source_url || null},
           ${input.source_attribution || null}, ${input.seo_title || null},
           ${input.seo_description || null}, ${input.canonical_url || null},
           ${input.featured_image_url || null}, ${input.is_sponsored ?? false}, ${user.email}, ${user.email})
        RETURNING id, title, slug, status, created_at
      ), review_log AS (
        INSERT INTO public.newsroom_review_events (article_id, actor_id, action, note)
        SELECT id, ${user.email}, 'created', 'Draft dibuat melalui CMS'
        FROM created RETURNING id
      ), security_log AS (
        INSERT INTO public.security_audit_events (actor_id, action, resource_type, resource_id, outcome, metadata)
        SELECT ${user.email}, 'article.created', 'newsroom_article', id::text, 'success',
               jsonb_build_object('status', status, 'slug', slug)
        FROM created RETURNING id
      )
      SELECT id, title, slug, status, created_at FROM created
    `;
    return NextResponse.json({ article: rows[0] }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error && error.message.toLowerCase().includes("duplicate") ? "Slug sudah digunakan." : "Draft gagal disimpan.";
    return NextResponse.json({ error: message }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
}