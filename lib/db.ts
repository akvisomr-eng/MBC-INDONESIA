import { Pool } from "pg";

declare global {
  // Reuse one connection pool across local hot reloads.
  // eslint-disable-next-line no-var
  var mbcPgPool: Pool | undefined;
}

export function getPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  if (!globalThis.mbcPgPool) {
    globalThis.mbcPgPool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000,
      ssl: connectionString.includes("neon.tech")
        ? { rejectUnauthorized: true }
        : undefined
    });
  }
  return globalThis.mbcPgPool;
}

export type PublicArticle = {
  id: string;
  title: string;
  slug: string;
  dek: string | null;
  category: string | null;
  author_name: string | null;
  featured_image_url: string | null;
  published_at: string | null;
};

export async function getLatestArticles(limit = 12): Promise<PublicArticle[]> {
  const pool = getPool();
  if (!pool) return [];
  const safeLimit = Math.max(1, Math.min(Math.floor(limit), 30));
  const result = await pool.query<PublicArticle>(
    `SELECT a.id, a.title, a.slug, a.dek, c.name AS category,
            a.author_name, a.featured_image_url, a.published_at
       FROM public.newsroom_articles a
       LEFT JOIN public.newsroom_categories c ON c.id = a.category_id
      WHERE a.status = 'published'
        AND (a.published_at IS NULL OR a.published_at <= NOW())
      ORDER BY a.published_at DESC NULLS LAST, a.created_at DESC
      LIMIT $1`,
    [safeLimit]
  );
  return result.rows;
}
