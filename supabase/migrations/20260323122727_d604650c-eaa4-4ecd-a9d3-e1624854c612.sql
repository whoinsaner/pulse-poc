-- Drop existing share-access policies that require authenticated role
DROP POLICY IF EXISTS "Shared report access via token" ON public.reports;
DROP POLICY IF EXISTS "Shared report analysis run access" ON public.analysis_runs;

-- Recreate share-access policy on reports for ALL roles (authenticated + anon)
CREATE POLICY "Shared report access via token" ON public.reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.report_shares rs
      WHERE rs.report_id = reports.id
        AND rs.revoked_at IS NULL
        AND rs.expires_at > now()
    )
  );

-- Recreate share-access policy on analysis_runs for ALL roles (authenticated + anon)
CREATE POLICY "Shared report analysis run access" ON public.analysis_runs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.report_shares rs
      JOIN public.reports r ON r.id = rs.report_id
      WHERE r.analysis_run_id = analysis_runs.id
        AND rs.revoked_at IS NULL
        AND rs.expires_at > now()
    )
  );