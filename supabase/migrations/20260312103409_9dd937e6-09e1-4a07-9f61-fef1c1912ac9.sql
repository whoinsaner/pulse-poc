CREATE TABLE public.extraction_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id uuid NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'processing',
  progress numeric NOT NULL DEFAULT 0,
  total_scenes integer NOT NULL DEFAULT 0,
  extracted_count integer NOT NULL DEFAULT 0,
  error text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.extraction_jobs ENABLE ROW LEVEL SECURITY;

-- Users can view jobs for scripts in their org
CREATE POLICY "Users can view extraction jobs in their org"
  ON public.extraction_jobs FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM scripts s
    WHERE s.id = extraction_jobs.script_id
    AND user_belongs_to_org(auth.uid(), s.organization_id)
  ));

-- Authenticated users can insert jobs
CREATE POLICY "Authenticated users can insert extraction jobs"
  ON public.extraction_jobs FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Allow service role updates (edge function uses service role)
CREATE POLICY "Service role can update extraction jobs"
  ON public.extraction_jobs FOR UPDATE
  USING (true)
  WITH CHECK (true);