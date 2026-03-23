
-- Restrict shared report access policies to authenticated users only

-- reports
DROP POLICY IF EXISTS "Shared report access via token" ON public.reports;
CREATE POLICY "Shared report access via token" ON public.reports
  FOR SELECT
  TO authenticated
  USING (public.report_has_valid_share(id));

-- analysis_runs
DROP POLICY IF EXISTS "Shared report analysis run access" ON public.analysis_runs;
CREATE POLICY "Shared report analysis run access" ON public.analysis_runs
  FOR SELECT
  TO authenticated
  USING (public.analysis_run_has_valid_share(id));

-- scripts
DROP POLICY IF EXISTS "Shared report script access" ON public.scripts;
CREATE POLICY "Shared report script access" ON public.scripts
  FOR SELECT
  TO authenticated
  USING (public.script_has_valid_share(id));

-- scenes
DROP POLICY IF EXISTS "Shared report scenes access" ON public.scenes;
CREATE POLICY "Shared report scenes access" ON public.scenes
  FOR SELECT
  TO authenticated
  USING (public.script_has_valid_share(script_id));

-- characters
DROP POLICY IF EXISTS "Shared report characters access" ON public.characters;
CREATE POLICY "Shared report characters access" ON public.characters
  FOR SELECT
  TO authenticated
  USING (public.script_has_valid_share(script_id));

-- parameter_scores
DROP POLICY IF EXISTS "Shared report parameter scores access" ON public.parameter_scores;
CREATE POLICY "Shared report parameter scores access" ON public.parameter_scores
  FOR SELECT
  TO authenticated
  USING (public.analysis_run_has_valid_share(analysis_run_id));

-- insights
DROP POLICY IF EXISTS "Shared report insights access" ON public.insights;
CREATE POLICY "Shared report insights access" ON public.insights
  FOR SELECT
  TO authenticated
  USING (public.analysis_run_has_valid_share(analysis_run_id));
