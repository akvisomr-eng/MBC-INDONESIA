-- Additive RBAC foundation. Apply to a non-production Neon branch first.
-- Neon Auth owns identity records; this table only maps existing Auth user IDs to MBC roles.
CREATE TABLE IF NOT EXISTS public.app_user_roles (
  user_id text NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin','editor','reporter','seo','finance','hr','advertising','read_only')),
  granted_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);
CREATE INDEX IF NOT EXISTS app_user_roles_email_idx ON public.app_user_roles (lower(email));
CREATE INDEX IF NOT EXISTS app_user_roles_role_idx ON public.app_user_roles (role);
