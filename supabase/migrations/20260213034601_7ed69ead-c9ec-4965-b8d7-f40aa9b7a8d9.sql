
-- Add retry tracking columns to analysis_runs
ALTER TABLE public.analysis_runs
  ADD COLUMN retry_count integer NOT NULL DEFAULT 0,
  ADD COLUMN max_retries integer NOT NULL DEFAULT 3,
  ADD COLUMN parent_run_id uuid REFERENCES public.analysis_runs(id);

-- Index for finding retryable failed runs
CREATE INDEX idx_analysis_runs_retry ON public.analysis_runs (status, retry_count, max_retries)
  WHERE status = 'failed' AND retry_count < max_retries;

-- Index for parent-child run relationships
CREATE INDEX idx_analysis_runs_parent ON public.analysis_runs (parent_run_id)
  WHERE parent_run_id IS NOT NULL;
