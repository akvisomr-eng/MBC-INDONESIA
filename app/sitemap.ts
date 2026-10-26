import type { MetadataRoute } from "next";
import { getPool } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mbcindonesia.id";
  const routes: MetadataRoute.Sitemap = [{ url: base, changeFrequency: "hourly", priority: 1 }];
  const pool = getPool();
  if (!pool) return routes;
  try {
    const result = await pool.query<{ slug: string; updated_at: string }>(
      `SELECT slug, updated_at FROM public.newsroom_articles
        WHERE status = 'published' AND (published_at IS NULL OR published_at <= NOW())
        ORDER BY updated_at DESC LIMIT 5000`
    );
    return routes.concat(result.rows.map((row) => ({
      url: `${base}/berita/${encodeURIComponent(row.slug)}`,
      lastModified: new Date(row.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7
    })));
  } catch {
    return routes;
  }
}
