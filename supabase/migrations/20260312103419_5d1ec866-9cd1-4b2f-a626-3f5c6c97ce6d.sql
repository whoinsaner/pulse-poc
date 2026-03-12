-- Drop the overly permissive update policy
DROP POLICY "Service role can update extraction jobs" ON public.extraction_jobs;

-- Only job creators can update their own jobs (service role bypasses RLS anyway)
CREATE POLICY "Users can update their own extraction jobs"
  ON public.extraction_jobs FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());