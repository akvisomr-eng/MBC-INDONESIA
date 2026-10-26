# MBC Indonesia — Editorial Intelligence Platform

MBC Indonesia is a newsroom and media operating platform. This repository is currently the application foundation; production database changes must be coordinated with the existing Neon `production` branch and must never drop existing tables or records.

## Product direction

Build a secure editorial platform that combines CMS, newsroom workflow, AI-assisted verification, SEO, CRM/advertising, accounting, HRD/payroll, and auditability. AI agents propose and prepare work; authorized human editors retain final control over publication and sensitive business operations.

## Multi-agent newsroom

Use a registry-driven orchestration layer. Each agent declares its objective, allowed tools, input/output schema, model/provider, timeout, budget, and approval policy. Every run records correlation ID, actor, inputs (redacted where necessary), outputs, model/provider, token/cost estimate, duration, status, and approvals.

Initial agents:
1. **Assignment Planner** — turns editor briefs into assignments, deadlines, and required sources.
2. **Research & Source Agent** — gathers source material and stores URLs, timestamps, and quoted evidence.
3. **Fact-check Agent** — flags unsupported claims, conflicting sources, dates, names, and numbers; never labels a claim verified without evidence.
4. **Drafting Agent** — prepares drafts in MBC editorial voice using approved sources.
5. **Copy Desk Agent** — checks clarity, spelling, style, attribution, and consistency.
6. **SEO Strategist Agent** — proposes search intent, keyword cluster, headline options, slug, meta description, headings, internal links, and FAQ opportunities.
7. **Technical SEO Agent** — audits indexability, canonical URL, robots directives, sitemap inclusion, structured data, broken links, image alt text, and performance findings.
8. **Compliance & Risk Agent** — flags privacy, defamation, copyright, sensitive-source, and legal-review concerns for human review.
9. **Audience Analytics Agent** — summarizes traffic and search performance only when trusted analytics data is connected.
10. **Orchestrator / Editor Briefing Agent** — routes tasks, merges results, highlights disagreement, and prepares an approval packet.

### Editorial workflow

`assignment → research → evidence review → draft → fact-check → copy desk → SEO review → editor approval → publish → monitor`

A failed check returns the item to the appropriate stage. Conflicting agents must surface disagreement and evidence, not silently choose a claim. Publishing, deleting, sending campaigns, and financial posting require role-based authorization and explicit human confirmation.

## SEO workspace

SEO tools should be available inside the CMS editor and a dedicated SEO dashboard:
- Keyword and topic-cluster planning with intent and target audience.
- Headline, excerpt, slug, title tag, meta description, and social preview suggestions.
- Content completeness, readability, originality-risk, attribution, and E-E-A-T editorial checklists.
- Internal-link recommendations based on existing MBC articles.
- Image alt-text suggestions and media metadata.
- JSON-LD structured data appropriate to the page type (NewsArticle, Organization, BreadcrumbList); validate before saving.
- Canonical, robots, sitemap, redirect, broken-link, and indexability checks.
- Search Console / analytics integrations only after credentials and permissions are configured.
- SEO score must be an explainable checklist, not a promise of rankings. Never fabricate keyword volume, search position, impressions, or traffic metrics when no data source is connected.
- Generate drafts and recommendations by default. Editor approval is required before publishing or changing canonical/robots directives.

## Core application modules

- Public news portal and article pages.
- CMS: drafts, revisions, media, tags, categories, scheduled publishing, preview.
- Newsroom: assignments, editorial calendar, source/evidence records, review queue.
- AI control center: agent registry, workflow runs, provider settings, usage/cost limits, audit log.
- SEO dashboard and per-article SEO workspace.
- CRM and advertising campaigns.
- Accounting: chart of accounts, journal entries, balanced posting validation, ledger and reports.
- HRD and payroll with strict role separation and access controls.
- Security: authentication, RBAC, rate limits, CSRF/XSS protections as applicable, audit events, retention and recovery controls.

## Proposed architecture

Start with a modular monolith and explicit module boundaries. Use the existing PostgreSQL/Neon database, server-side API routes, and the deployment platform selected for the project. Keep model providers behind a common server-side adapter so the system can begin on free tiers and switch providers without changing editorial workflows. Store keys only in environment secrets; never commit credentials or expose them to the browser.

Suggested logical services:
- `editorial`: articles, revisions, categories, tags, media, assignments, approvals.
- `ai-orchestration`: agent registry, run queue, policy checks, event log, cost limits.
- `seo`: audit results, metadata suggestions, structured-data validation, keyword plans.
- `identity`: users, roles, permissions, sessions.
- `business`: CRM, ads, accounting, HR/payroll.
- `observability`: structured logs, correlation IDs, health checks, alerts.

## Database and migration safety

- Inspect the live schema before writing migrations; use additive, versioned migrations.
- Never drop or rename production objects without an explicit reviewed migration and recovery plan.
- Test migrations on a non-production branch first.
- Verify backup/snapshot availability and rehearse recovery procedures.
- Accounting posting must enforce debit = credit transactionally.
- Enforce least privilege and tenant/record-level authorization in server-side code and database policies where applicable.
- Do not import fabricated articles, user records, ad campaigns, or financial data.

## Delivery milestones

1. Inspect and document current Neon schema and repository/deployment setup.
2. Establish app scaffold, environment validation, CI, lint, type-check, and tests.
3. Implement auth/RBAC and CMS read/write flows.
4. Implement editorial workflow and audit trail.
5. Implement AI provider adapter, agent registry, safe orchestration, approval queue, and usage limits.
6. Implement article-level SEO tools and technical audit.
7. Connect analytics/search performance sources and reporting.
8. Add CRM, advertising, accounting, and HR/payroll modules.
9. Run security review, backup/restore drill, end-to-end tests, and staged deployment.

## Acceptance criteria

- No AI agent can publish, delete, or post financial transactions without explicit authorized approval.
- Each agent run is traceable and budget-limited.
- SEO recommendations are evidence-based and explainable; missing data is clearly identified.
- Authentication and authorization tests cover positive and negative access paths.
- CI passes before merge/deploy.
- Production migration has a backup/recovery plan and post-migration verification.
- No secrets or private user data are committed to Git.


## Implemented application foundation (branch: feat/operational-foundation)

- Next.js 16 application and responsive Indonesian-language public landing page.
- Public article detail pages for published records only, canonical metadata, Open Graph/Twitter metadata, NewsArticle JSON-LD, sitemap, and robots policy.
- Neon PostgreSQL health check at `GET /api/health` and published-only JSON feed at `GET /api/news`.
- Neon Managed Auth integration on the isolated Neon preview branch; admin access is denied unless the user's email is included in `MBC_ADMIN_EMAILS`.
- Initial CMS supports creating drafts, listing drafts, and submitting eligible drafts to editorial review. It does not publish automatically.
- Initial AI agent registry and a budget-guarded execution endpoint. Agent execution is disabled unless `MBC_AI_AGENTS_ENABLED=true`, the provider is configured, and a daily budget/rate configuration is supplied.
- Audit events are written for draft creation, review submission, and AI runs.
- GitHub Actions CI runs tests, TypeScript checks, ESLint, and production build.

## Local development

1. Install Node.js 22 or newer and npm.
2. Copy `.env.example` to `.env.local`.
3. Set `DATABASE_URL` to an isolated Neon preview/test branch connection string.
4. Set `NEON_AUTH_BASE_URL` to the Managed Auth URL for the same branch and generate `NEON_AUTH_COOKIE_SECRET` (at least 32 characters).
5. Add trusted administrator emails to `MBC_ADMIN_EMAILS` (comma-separated). Do not set an administrator email based on guesswork.
6. Keep `MBC_AI_AGENTS_ENABLED=false` until provider credentials, rate costs, daily budget, and usage limits are reviewed.
7. Run `npm install`, `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, then `npm run dev`.

## Main endpoints

- `GET /api/health` — non-sensitive application/database status.
- `GET /api/news` — latest published articles only.
- `GET /api/admin/overview` — admin-only newsroom/agent status counts.
- `GET|POST /api/admin/articles` — admin-only article listing and draft creation.
- `POST /api/admin/articles/:id/submit-review` — move eligible drafts into editorial review; never publishes.
- `POST /api/admin/agents/run` — admin-only provider-backed agent run, guarded by feature flag, daily run cap, configured rates, and daily budget.

## Release limitations

This is an implementation branch, not a declaration of production readiness. Do not connect it to production data or switch the public domain until CI is green and preview verification is complete. Editor/reporter role granularity, article editing and rejection UI, media upload workflow, CRM/finance/payroll workflows, external analytics/Search Console integration, custom production SMTP, provider-specific integration tests, rate limiting, and incident/rollback drills remain release work. Preview deployments are configured to avoid indexing.


## Import artikel lama dari WordPress (staging only)

The importer reads public posts from the MBC Indonesia WordPress REST API and creates **drafts only** in the configured Neon database. It does not publish, overwrite existing slugs, or copy the source publication date into the new publication field.

1. Set DATABASE_URL to the isolated Neon staging branch and set MBC_SOURCE_WORDPRESS_URL.
2. Run `npm run import:wordpress -- --limit=100` for a dry run.
3. Inspect the titles and source links.
4. Only if the target is staging, run `MBC_IMPORT_CONFIRM_TARGET=staging npm run import:wordpress -- --apply --limit=100`.
5. Review every imported draft, confirm attribution and source, then approve/publish using the editorial workflow.

The explicit staging confirmation and `--apply` flag are both required before the script writes data. Never point this importer at the production branch without a separately approved migration plan.
