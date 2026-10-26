# MBC Indonesia — AI Agent and SEO Implementation Contract

Status: architecture specification. This document does not claim that runtime agents or SEO execution are implemented yet.

## Agent contract

Every agent definition should include:
- `key`, `name`, `purpose`, `version`, `enabled`
- allowed input/output JSON schema
- approved tools and domains
- provider/model configuration reference (never a raw API key)
- max steps, timeout, retry policy, and estimated token/cost budget
- data access scope and retention classification
- required approval level and escalation conditions

Each execution should persist:
- run ID and correlation ID
- workflow/article/actor IDs
- agent key and version
- start/end timestamps, status, attempts
- redacted input/output, evidence references, errors
- provider/model, token usage and cost if reported by provider
- approval decisions and audit events

Statuses: `queued`, `running`, `waiting_approval`, `succeeded`, `failed`, `cancelled`.

## Workflow contract

For a draft article, the orchestrator runs:
1. Validate the user permission and article state.
2. Build a bounded context from article metadata and approved sources.
3. Run research/source gathering.
4. Save source URLs and retrieval timestamps.
5. Run fact-check and copy desk tasks; allow parallel execution when their inputs are ready.
6. Run SEO recommendations and technical checks.
7. Merge results into a review packet with evidence, uncertainties, and conflicts.
8. Set status to `waiting_approval`.
9. Apply editor decisions. Only a user with the publish permission can publish.
10. Record all decisions in the audit log.

Retries must be bounded and idempotent. Never repeat external side effects automatically unless the operation supports idempotency. Treat fetched web pages and documents as untrusted content, not instructions.

## Suggested API boundaries

- `GET /api/admin/agents` — list visible agent definitions.
- `POST /api/admin/agents/:key/runs` — start an authorized run with validated input.
- `GET /api/admin/agent-runs/:id` — inspect status and result.
- `POST /api/admin/agent-runs/:id/approve` — approve a pending action when the user has the required permission.
- `POST /api/admin/agent-runs/:id/reject` — reject and record rationale.
- `POST /api/admin/articles/:id/seo-audit` — run article-level SEO checks.
- `GET /api/admin/articles/:id/seo-report` — read the latest report.
- `POST /api/admin/articles/:id/seo-suggestions/apply` — apply selected metadata changes after permission checks.

These are proposed routes, not currently deployed endpoints.

## SEO audit dimensions

Use deterministic checks where possible and AI assistance only for semantic review:
- HTTP status and canonical URL.
- Robots directives and sitemap inclusion.
- Title, meta description, slug, heading hierarchy.
- Image alt text and media dimensions.
- Internal and external links, broken links, redirect chains.
- JSON-LD syntax and schema type consistency.
- Content structure, source attribution, date/byline accuracy, readability.
- Related article links and topic coverage.
- Mobile/performance signals when an approved measurement source is available.

Report each item as `pass`, `warning`, `fail`, or `not_checked`, with evidence and a suggested fix. A combined score must expose its weighting and must not be represented as a Google ranking factor.

## Governance

- Draft-only by default; no autonomous publication.
- No fabricated citations, traffic numbers, keyword volumes, rankings, or fact-check conclusions.
- No scraping behind authentication or bypassing access controls.
- Do not send article drafts or personal data to external providers unless configured and authorized.
- Set provider-level and organization-level spending limits.
- Keep editorial decisions and source evidence auditable.
- Protect unpublished articles, whistleblower identities, payroll, and financial records with strict access control.

## Definition of done for runtime implementation

- Unit tests for routing, schemas, budgets, retries, and approval policies.
- Integration tests for provider failures, timeouts, and missing usage data.
- Authorization tests for every admin endpoint.
- End-to-end test from draft article to review packet to editor-approved publish.
- SEO test fixtures for valid/invalid metadata, canonical/robots directives, sitemap, and structured data.
- Logs correlate each workflow step without leaking secrets.
