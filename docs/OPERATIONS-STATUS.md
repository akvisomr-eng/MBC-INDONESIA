# MBC Indonesia — Status Operasional

## Fondasi yang ada di branch implementasi
- Next.js application with Indonesian public homepage.
- Neon PostgreSQL connection adapter and non-sensitive health endpoint.
- Published-only public news feed, article detail routes, metadata, NewsArticle JSON-LD, sitemap, and robots.
- Neon Managed Auth provisioned on an isolated Neon test branch; app uses environment-specific auth URL and a fail-closed admin email allowlist.
- Admin overview and initial CMS draft creation/listing API with input validation, audit events, and editorial review submission.
- AI-agent registry is disabled by default; no AI agent can publish content.
- SEO audit helper, automated tests, and GitHub Actions CI.

## Environment required for preview
- DATABASE_URL: Neon connection string for the same isolated branch used by the preview.
- NEON_AUTH_BASE_URL: Auth base URL for that exact branch.
- NEON_AUTH_COOKIE_SECRET: random secret of at least 32 characters, stored only in deployment secrets.
- MBC_ADMIN_EMAILS: comma-separated allowlist of trusted administrator email addresses; otherwise admin access is denied.
- NEXT_PUBLIC_SITE_URL: canonical public site origin.

## Important constraints
- Do not point the preview to the production database until integration testing is complete.
- No endpoint publishes articles; only authorized admins may create drafts and submit them for review.
- AI agents are not enabled and no paid AI provider is called.
- Article editing, category management UI, media uploads, approval/rejection UI, provider configuration, and production-grade RBAC beyond admin allowlist are not yet complete.
- No production deployment was made by these changes.

## Go-live gate
1. Confirm CI green for tests, typecheck, lint, and build.
2. Configure preview environment variables and test Neon Auth sign-up/sign-in/session/unauthorized access.
3. Test draft creation, duplicate slug handling, audit events, review submission, and public article visibility on the isolated database branch.
4. Add editor/reporter roles and least-privilege permissions before inviting newsroom staff.
5. Configure custom SMTP and trusted origins before production auth rollout.
6. Complete rollback, backup, rate-limit, abuse, logging, and secret-rotation checks.
7. Obtain explicit release approval before production deployment.
