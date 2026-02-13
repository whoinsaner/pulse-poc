
-- Create a safe view for invitations that excludes the token column
CREATE VIEW public.invitations_safe
WITH (security_invoker = on) AS
  SELECT id, organization_id, email, role, invited_by, expires_at, accepted_at, created_at
  FROM public.invitations;
