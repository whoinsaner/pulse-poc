
-- Create a SECURITY DEFINER function to check if a report has any valid share
-- This bypasses RLS on report_shares so it can be used in policies on other tables
CREATE OR REPLACE FUNCTION public.report_has_valid_share(_report_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.report_shares
    WHERE report_id = _report_id
      AND revoked_at IS NULL
      AND expires_at > now()
  )
$$;

-- Also create a function to check share for a script_id (via reports)
CREATE OR REPLACE FUNCTION public.script_has_valid_share(_script_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.report_shares rs
    JOIN public.reports r ON r.id = rs.report_id
    WHERE r.script_id = _script_id
      AND rs.revoked_at IS NULL
      AND rs.expires_at > now()
  )
$$;

-- Also create a function to check share for an analysis_run_id (via reports)
CREATE OR REPLACE FUNCTION public.analysis_run_has_valid_share(_run_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.report_shares rs
    JOIN public.reports r ON r.id = rs.report_id
    WHERE r.analysis_run_id = _run_id
      AND rs.revoked_at IS NULL
      AND rs.expires_at > now()
  )
$$;

-- Drop and recreate the reports shared access policy using the function
DROP POLICY IF EXISTS "Shared report access via token" ON public.reports;
CREATE POLICY "Shared report access via token" ON public.reports
  FOR SELECT
  USING (public.report_has_valid_share(id));

-- Drop and recreate the analysis_runs shared access policy using the function
DROP POLICY IF EXISTS "Shared report analysis run access" ON public.analysis_runs;
CREATE POLICY "Shared report analysis run access" ON public.analysis_runs
  FOR SELECT
  USING (public.analysis_run_has_valid_share(id));

-- Update shared access policies on related tables to use SECURITY DEFINER functions

-- scripts
DROP POLICY IF EXISTS "Shared report script access" ON public.scripts;
CREATE POLICY "Shared report script access" ON public.scripts
  FOR SELECT
  USING (public.script_has_valid_share(id));

-- scenes
DROP POLICY IF EXISTS "Shared report scenes access" ON public.scenes;
CREATE POLICY "Shared report scenes access" ON public.scenes
  FOR SELECT
  USING (public.script_has_valid_share(script_id));

-- characters
DROP POLICY IF EXISTS "Shared report characters access" ON public.characters;
CREATE POLICY "Shared report characters access" ON public.characters
  FOR SELECT
  USING (public.script_has_valid_share(script_id));

-- parameter_scores
DROP POLICY IF EXISTS "Shared report parameter scores access" ON public.parameter_scores;
CREATE POLICY "Shared report parameter scores access" ON public.parameter_scores
  FOR SELECT
  USING (public.analysis_run_has_valid_share(analysis_run_id));

-- insights
DROP POLICY IF EXISTS "Shared report insights access" ON public.insights;
CREATE POLICY "Shared report insights access" ON public.insights
  FOR SELECT
  USING (public.analysis_run_has_valid_share(analysis_run_id));
