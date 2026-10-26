export type SeoInput = {
  title: string;
  slug: string;
  description?: string | null;
  canonicalUrl?: string | null;
  imageUrl?: string | null;
  body?: string | null;
};

export type SeoFinding = { key: string; level: "error" | "warning" | "info"; message: string };

export function auditSeo(input: SeoInput): SeoFinding[] {
  const findings: SeoFinding[] = [];
  const title = input.title.trim();
  const description = (input.description ?? "").trim();
  const slug = input.slug.trim();
  const body = (input.body ?? "").trim();

  if (!title) findings.push({ key: "title-missing", level: "error", message: "Judul wajib diisi." });
  else if (title.length < 20 || title.length > 70) findings.push({ key: "title-length", level: "warning", message: "Pertimbangkan judul sekitar 20–70 karakter; utamakan kejelasan, bukan pemaksaan kata kunci." });
  if (!description) findings.push({ key: "description-missing", level: "warning", message: "Meta description belum diisi." });
  else if (description.length < 70 || description.length > 170) findings.push({ key: "description-length", level: "warning", message: "Periksa panjang meta description (panduan editorial 70–170 karakter)." });
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) findings.push({ key: "slug-format", level: "error", message: "Slug harus menggunakan huruf kecil, angka, dan tanda hubung." });
  if (!input.canonicalUrl) findings.push({ key: "canonical-missing", level: "warning", message: "Canonical URL belum ditetapkan." });
  if (!input.imageUrl) findings.push({ key: "image-missing", level: "info", message: "Tambahkan gambar utama yang relevan beserta alt text di pengelola media." });
  if (body.length < 300) findings.push({ key: "body-short", level: "info", message: "Naskah masih pendek; pastikan konteks, sumber, dan dampak sudah memadai." });
  return findings;
}