# MBC Indonesia — Status Operasional

## Fondasi yang sudah ada di branch ini
- Next.js application scaffold with Indonesian-language public homepage.
- PostgreSQL/Neon connectivity adapter using server-side DATABASE_URL.
- Non-sensitive health endpoint at GET /api/health.
- Public published-article feed at GET /api/news; no draft articles are returned.
- Initial AI-agent registry with all agents disabled by default.
- Deterministic SEO audit helper and automated CI workflow.
- Basic response security headers and environment-variable template.

## Belum boleh dianggap siap produksi
- Authentication, session management, and role-based access control (RBAC) are not implemented.
- Admin mutations, article create/edit/review/publish endpoints are not implemented.
- AI provider calls, prompt/version controls, retries, budget limits, and provider credentials are not implemented.
- Search Console / analytics integration is not configured.
- Public homepage currently uses editorial/channel placeholders; it is not yet wired to the news feed.
- No production deployment has been made by this change.

## Required environment
- DATABASE_URL: Neon pooled or direct PostgreSQL connection string, stored only in deployment secret settings.
- NEXT_PUBLIC_SITE_URL: canonical site origin for metadata.
- AI_PROVIDER and AI_API_KEY: future use only; do not configure until provider adapter and spending guardrails are implemented.

## Go-live gate
1. Add and test authentication + RBAC before exposing CMS or admin routes.
2. Validate DB reads/writes on a non-production branch with integration tests.
3. Add editorial approval audit trails and prohibit autonomous publication.
4. Verify SEO metadata, canonical URLs, sitemap, robots, and structured data.
5. Verify rollback, backups, logging, rate limiting, and secrets rotation.
6. Obtain explicit release approval before deploying to production.
