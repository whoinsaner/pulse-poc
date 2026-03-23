-- Allow authenticated users to view analysis_runs for shared reports
CREATE POLICY "Shared report analysis run access"
ON public.analysis_runs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.report_shares rs
    JOIN public.reports r ON r.id = rs.report_id
    WHERE r.analysis_run_id = analysis_runs.id
      AND rs.revoked_at IS NULL
      AND rs.expires_at > now()
  )
);

-- Allow authenticated users to view parameter_scores for shared reports
CREATE POLICY "Shared report parameter scores access"
ON public.parameter_scores
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.report_shares rs
    JOIN public.reports r ON r.id = rs.report_id
    JOIN public.analysis_runs ar ON ar.id = r.analysis_run_id
    WHERE ar.id = parameter_scores.analysis_run_id
      AND rs.revoked_at IS NULL
      AND rs.expires_at > now()
  )
);

-- Allow authenticated users to view insights for shared reports
CREATE POLICY "Shared report insights access"
ON public.insights
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.report_shares rs
    JOIN public.reports r ON r.id = rs.report_id
    JOIN public.analysis_runs ar ON ar.id = r.analysis_run_id
    WHERE ar.id = insights.analysis_run_id
      AND rs.revoked_at IS NULL
      AND rs.expires_at > now()
  )
);

-- Allow authenticated users to view scripts for shared reports
CREATE POLICY "Shared report script access"
ON public.scripts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.report_shares rs
    JOIN public.reports r ON r.id = rs.report_id
    WHERE r.script_id = scripts.id
      AND rs.revoked_at IS NULL
      AND rs.expires_at > now()
  )
);

-- Allow authenticated users to view scenes for shared reports
CREATE POLICY "Shared report scenes access"
ON public.scenes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.report_shares rs
    JOIN public.reports r ON r.id = rs.report_id
    WHERE r.script_id = scenes.script_id
      AND rs.revoked_at IS NULL
      AND rs.expires_at > now()
  )
);

-- Allow authenticated users to view characters for shared reports
CREATE POLICY "Shared report characters access"
ON public.characters
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.report_shares rs
    JOIN public.reports r ON r.id = rs.report_id
    WHERE r.script_id = characters.script_id
      AND rs.revoked_at IS NULL
      AND rs.expires_at > now()
  )
);