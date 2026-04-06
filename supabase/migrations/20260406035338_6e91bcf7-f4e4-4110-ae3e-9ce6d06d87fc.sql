
-- Fix 1: Update share functions to verify caller supplies the share token via header
-- The token is read from the PostgREST request header 'x-share-token'

CREATE OR REPLACE FUNCTION public.report_has_valid_share(_report_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.report_shares
    WHERE report_id = _report_id
      AND token = current_setting('request.header.x-share-token', true)
      AND revoked_at IS NULL
      AND expires_at > now()
  )
$$;

CREATE OR REPLACE FUNCTION public.script_has_valid_share(_script_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.report_shares rs
    JOIN public.reports r ON r.id = rs.report_id
    WHERE r.script_id = _script_id
      AND rs.token = current_setting('request.header.x-share-token', true)
      AND rs.revoked_at IS NULL
      AND rs.expires_at > now()
  )
$$;

CREATE OR REPLACE FUNCTION public.analysis_run_has_valid_share(_run_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.report_shares rs
    JOIN public.reports r ON r.id = rs.report_id
    WHERE r.analysis_run_id = _run_id
      AND rs.token = current_setting('request.header.x-share-token', true)
      AND rs.revoked_at IS NULL
      AND rs.expires_at > now()
  )
$$;

-- Fix 2: Update has_report_share_access to also verify token
CREATE OR REPLACE FUNCTION public.has_report_share_access(_user_id uuid, _report_id uuid, _token text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.report_shares
    WHERE report_id = _report_id
      AND token = _token
      AND revoked_at IS NULL
      AND expires_at > now()
  )
$$;

-- Fix 3: Restrict self-insert role to 'admin' only on org creation
DROP POLICY IF EXISTS "Users can insert their own role on org creation" ON public.user_roles;
CREATE POLICY "Users can insert their own role on org creation"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND role = 'admin'::app_role
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.organization_id = user_roles.organization_id
    )
  );
