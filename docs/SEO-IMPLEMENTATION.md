# SEO implementation notes

- Article pages resolve only records with status = published and published_at <= NOW().
- Per-article metadata includes title, description, canonical URL, Open Graph, and Twitter card.
- NewsArticle JSON-LD is generated from stored editorial fields; article content is rendered as escaped text, not raw HTML.
- sitemap.xml is generated from published articles; robots.txt excludes API and admin paths.
- SEO helper checks missing/weak metadata and slug formatting. Length recommendations are editorial heuristics, not ranking guarantees.
- Before launch, verify canonical domain, featured image host/alt text, structured data with Google's validator, redirects, and Search Console ownership.
