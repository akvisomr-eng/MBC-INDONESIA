import type { MetadataRoute } from "next";
import { getSql } from "@/lib/db";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.mbcindonesia.id").replace(/\/$/, "");
  const entries: MetadataRoute.Sitemap = [{ url: base, changeFrequency: "hourly", priority: 1 }];
  const sql = getSql();
  if (!sql) return entries;
  try {
    const rows = await sql`SELECT slug, updated_at, published_at FROM public.newsroom_articles WHERE status = 'published' AND published_at <= NOW() ORDER BY published_at DESC LIMIT 5000`;
    for (const row of rows as { slug: string; updated_at: string; published_at: string | null }[]) {
      entries.push({
        url: `${base}/berita/${encodeURIComponent(row.slug)}`,
        lastModified: new Date(row.updated_at || row.published_at || Date.now()),
        changeFrequency: "weekly",
        priority: 0.7
      });
    }
  } catch {
    // Keep the public homepage discoverable even if the database is temporarily unavailable.
  }
  return entries;
}