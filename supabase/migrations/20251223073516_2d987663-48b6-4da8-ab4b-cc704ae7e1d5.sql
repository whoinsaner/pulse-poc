-- Fix overly permissive "System can insert" policies by adding organization membership checks
-- These policies previously allowed ANY authenticated user to insert data

-- Drop existing permissive INSERT policies and replace with proper org-scoped policies

-- 1. scenes table: restrict inserts to users who belong to the script's organization
DROP POLICY IF EXISTS "System can insert scenes" ON public.scenes;
CREATE POLICY "Org members can insert scenes via script"
ON public.scenes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.scripts s
    WHERE s.id = script_id
    AND public.user_belongs_to_org(auth.uid(), s.organization_id)
  )
);

-- 2. characters table: restrict inserts to users who belong to the script's organization
DROP POLICY IF EXISTS "System can insert characters" ON public.characters;
CREATE POLICY "Org members can insert characters via script"
ON public.characters
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.scripts s
    WHERE s.id = script_id
    AND public.user_belongs_to_org(auth.uid(), s.organization_id)
  )
);

-- 3. narrative_graphs table: restrict inserts to users who belong to the script's organization
DROP POLICY IF EXISTS "System can insert narrative graphs" ON public.narrative_graphs;
CREATE POLICY "Org members can insert narrative_graphs via script"
ON public.narrative_graphs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.scripts s
    WHERE s.id = script_id
    AND public.user_belongs_to_org(auth.uid(), s.organization_id)
  )
);

-- 4. analysis_runs table: fix UPDATE policy to require org membership
DROP POLICY IF EXISTS "System can update analysis runs" ON public.analysis_runs;
CREATE POLICY "Org members can update analysis runs"
ON public.analysis_runs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.scripts s
    WHERE s.id = script_id
    AND public.user_belongs_to_org(auth.uid(), s.organization_id)
  )
);

-- 5. parameter_scores table: restrict inserts to users who belong to the analysis run's organization
DROP POLICY IF EXISTS "System can insert parameter scores" ON public.parameter_scores;
CREATE POLICY "Org members can insert parameter_scores via analysis"
ON public.parameter_scores
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.analysis_runs ar
    JOIN public.scripts s ON s.id = ar.script_id
    WHERE ar.id = analysis_run_id
    AND public.user_belongs_to_org(auth.uid(), s.organization_id)
  )
);

-- 6. insights table: restrict inserts to users who belong to the analysis run's organization
DROP POLICY IF EXISTS "System can insert insights" ON public.insights;
CREATE POLICY "Org members can insert insights via analysis"
ON public.insights
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.analysis_runs ar
    JOIN public.scripts s ON s.id = ar.script_id
    WHERE ar.id = analysis_run_id
    AND public.user_belongs_to_org(auth.uid(), s.organization_id)
  )
);

-- 7. reports table: restrict inserts to users who belong to the organization
DROP POLICY IF EXISTS "System can insert reports" ON public.reports;
CREATE POLICY "Org members can insert reports"
ON public.reports
FOR INSERT
WITH CHECK (
  public.user_belongs_to_org(auth.uid(), organization_id)
);