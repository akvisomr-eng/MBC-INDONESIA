import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sql = getSql();
  if (!sql) {
    return NextResponse.json({ error: "News feed belum tersedia: DATABASE_URL belum dikonfigurasi." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const articles = await sql`
      SELECT a.id, a.title, a.slug, a.dek, a.seo_title, a.seo_description,
             a.featured_image_url, a.author_name, a.published_at,
             c.name AS category_name
      FROM public.newsroom_articles a
      LEFT JOIN public.newsroom_categories c ON c.id = a.category_id
      WHERE a.status = 'published' AND a.published_at <= NOW()
      ORDER BY a.published_at DESC
      LIMIT 30
    `;
    return NextResponse.json({ articles }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch {
    return NextResponse.json({ error: "News feed sementara tidak tersedia." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}