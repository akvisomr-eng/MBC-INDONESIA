import { neon } from "@neondatabase/serverless";

const sourceBase = (process.env.MBC_SOURCE_WORDPRESS_URL || "https://www.mbcindonesia.id").replace(/\/$/, "");
const databaseUrl = process.env.DATABASE_URL;
const apply = process.argv.includes("--apply");
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Math.max(1, Math.min(1000, Number(limitArg.split("=")[1]) || 100)) : 100;

if (!databaseUrl) {
  console.error("DATABASE_URL wajib diisi dengan koneksi Neon branch staging.");
  process.exit(1);
}
if (apply && process.env.MBC_IMPORT_CONFIRM_TARGET !== "staging") {
  console.error("Import diblokir. Untuk menulis, gunakan branch staging dan set MBC_IMPORT_CONFIRM_TARGET=staging bersama flag --apply.");
  process.exit(1);
}

const sql = neon(databaseUrl);

function decodeHtml(value = "") {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function htmlToText(html = "") {
  return decodeHtml(html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/(p|h[1-6]|li|div|blockquote|section|article)>/gi, "\n\n")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, ""))
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fetchPosts() {
  const all = [];
  for (let page = 1; all.length < limit; page++) {
    const url = new URL("/wp-json/wp/v2/posts", sourceBase);
    url.searchParams.set("per_page", String(Math.min(100, limit - all.length)));
    url.searchParams.set("page", String(page));
    url.searchParams.set("_embed", "1");
    url.searchParams.set("status", "publish");
    const response = await fetch(url, { headers: { "Accept": "application/json", "User-Agent": "MBC-Indonesia-Staging-Importer/1.0" } });
    if (response.status === 400 && page > 1) break;
    if (!response.ok) throw new Error(`Sumber WordPress mengembalikan HTTP ${response.status} pada halaman ${page}.`);
    const posts = await response.json();
    if (!Array.isArray(posts) || posts.length === 0) break;
    all.push(...posts);
    const totalPages = Number(response.headers.get("X-WP-TotalPages") || page);
    if (page >= totalPages) break;
  }
  return all.slice(0, limit);
}

const categoryRows = await sql`SELECT id, slug, name FROM public.newsroom_categories`;
const categoryBySlug = new Map(categoryRows.map((row) => [String(row.slug).toLowerCase(), row]));
const posts = await fetchPosts();

console.log(`Sumber: ${sourceBase}`);
console.log(`Ditemukan ${posts.length} artikel; mode: ${apply ? "APPLY ke staging sebagai draft" : "DRY RUN (tidak ada perubahan database)"}`);

let inserted = 0;
let skipped = 0;
for (const post of posts) {
  const title = htmlToText(post.title?.rendered || "").slice(0, 220);
  const slug = String(post.slug || "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 220);
  const body = htmlToText(post.content?.rendered || "").slice(0, 100000);
  const dek = htmlToText(post.excerpt?.rendered || "").slice(0, 500) || null;
  const sourceUrl = typeof post.link === "string" ? post.link : null;
  const originalDate = typeof post.date_gmt === "string" ? post.date_gmt : (typeof post.date === "string" ? post.date : "");
  const terms = post._embedded?.["wp:term"]?.[0] || [];
  const category = terms.map((term) => categoryBySlug.get(String(term.slug || "").toLowerCase())).find(Boolean);
  const authorName = post._embedded?.author?.[0]?.name || "Redaksi MBC Indonesia";
  if (!title || !slug || !body) { skipped++; continue; }
  console.log(`- ${title} [${slug}]`);
  if (!apply) continue;

  const attribution = `Migrasi dari MBC Indonesia; tanggal terbit asli: ${originalDate || "tidak tersedia"}. Disimpan sebagai draft untuk verifikasi redaksi.`;
  const result = await sql`
    WITH created AS (
      INSERT INTO public.newsroom_articles
        (title, slug, dek, body_markdown, status, category_id, author_name,
         source_url, source_attribution, seo_title, seo_description, created_by, updated_by)
      VALUES
        (${title}, ${slug}, ${dek}, ${body}, 'draft', ${category?.id || null},
         ${authorName}, ${sourceUrl}, ${attribution}, ${title},
         ${dek ? dek.slice(0, 320) : null}, 'wordpress-staging-import', 'wordpress-staging-import')
      ON CONFLICT (slug) DO NOTHING
      RETURNING id, slug
    ), review_log AS (
      INSERT INTO public.newsroom_review_events (article_id, actor_id, action, note)
      SELECT id, 'wordpress-staging-import', 'created', 'Diimpor sebagai draft; wajib review sebelum publikasi'
      FROM created RETURNING id
    ), security_log AS (
      INSERT INTO public.security_audit_events (actor_id, action, resource_type, resource_id, outcome, metadata)
      SELECT 'wordpress-staging-import', 'article.imported', 'newsroom_article', id::text, 'success',
             jsonb_build_object('source_url', ${sourceUrl}, 'original_date', ${originalDate})
      FROM created RETURNING id
    )
    SELECT id, slug FROM created
  `;
  if (result.length) inserted++;
  else skipped++;
}
console.log(`Selesai. Draft baru: ${inserted}; dilewati/kosong/duplikat: ${skipped}.`);
if (!apply) console.log("Untuk menulis ke staging saja: MBC_IMPORT_CONFIRM_TARGET=staging node scripts/import-wordpress.mjs --apply");
