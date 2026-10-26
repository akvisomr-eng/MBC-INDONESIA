# MBC Indonesia — Operational Runbook

## Current environment split

- Git repository: `akvisomr-eng/MBC-INDONESIA`
- Application runtime: Vercel project `mbc-indonesia-preview`
- Preview database: Neon branch `mbc-preview-operational` (`neondb`)
- Production database: Neon branch `production` (`neondb`)
- Never reuse the preview `DATABASE_URL` or preview Auth URL in Production.

## Vercel environment variables

Set these through Vercel Project Settings → Environment Variables. Do not put real values in Git.

| Variable | Preview | Production |
|---|---|---|
| `DATABASE_URL` | Connection string for the preview branch only | Connection string for the production branch only |
| `NEON_AUTH_BASE_URL` | Auth endpoint for the same preview branch | Auth endpoint for the production branch |
| `NEON_AUTH_COOKIE_SECRET` | Unique generated secret | A different unique generated secret |
| `NEXT_PUBLIC_SITE_URL` | Preview URL | Official MBC canonical origin |

Generate a cookie secret with `openssl rand -base64 32`. Keep it in the hosting secret store only. Do not share or commit it.

## Initial administrator provisioning

Public self-registration is intentionally not exposed. Once an authorized MBC administrator has created/verified an account in Neon Auth, assign its exact Auth user ID and verified email to a role on the intended database branch. The application checks both user ID and email.

Example for a **non-production branch only** (replace placeholders; do not run as-is):

```sql
INSERT INTO public.app_user_roles (user_id, email, role, granted_by)
VALUES ('<NEON_AUTH_USER_ID>', '<VERIFIED_ADMIN_EMAIL>', 'admin', 'bootstrap')
ON CONFLICT (user_id, role)
DO UPDATE SET email = EXCLUDED.email;
```

Verify the user ID from the authenticated session before granting the admin role. Do not grant roles based only on an unverified email address. Role changes must be recorded in the change log / ticket before applying them to Production.

## Deployment process

1. Work on a feature branch.
2. Keep the GitHub pull request in draft until type-check and production build pass.
3. Apply additive migrations to `mbc-preview-operational` first.
4. Verify preview routes and authentication with a real test account.
5. Review authorization and negative-access tests.
6. Back up and verify the production branch before any production migration.
7. Deploy Production only after the PR is reviewed and merged, the Production-only secrets are configured, and the editor/admin access test passes.

## Current functional boundaries

- Public homepage and article detail pages read only published articles.
- `/api/health` reports application/database connectivity without returning secrets.
- Neon Auth login proxy is implemented; admin and newsroom paths are protected by auth middleware.
- RBAC is additive and role-gated; no role is assigned automatically.
- CMS write/review/publish, AI orchestration, CRM, accounting, HR/payroll, and operational alerting are not yet release-complete. AI must remain disabled until provider credentials, quota/billing, rate limits, and approval policies are verified.
