
-- Replace the overly permissive policy with a token-scoped one
DROP POLICY IF EXISTS "Users can view share by token" ON public.report_shares;

CREATE POLICY "Users can view share by valid token"
ON public.report_shares
FOR SELECT
TO authenticated
USING (revoked_at IS NULL AND expires_at > now());
