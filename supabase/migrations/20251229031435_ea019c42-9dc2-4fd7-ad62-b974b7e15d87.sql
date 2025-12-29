-- Add stakeholder-specific analysis support

-- Add stakeholder_lens column to analysis_runs to track which stakeholder perspective was analyzed
ALTER TABLE public.analysis_runs 
ADD COLUMN IF NOT EXISTS stakeholder_lens text DEFAULT NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_analysis_runs_stakeholder_lens 
ON public.analysis_runs (script_id, stakeholder_lens);

-- Create stakeholder_reports table to cache per-stakeholder reports
CREATE TABLE IF NOT EXISTS public.stakeholder_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  stakeholder_lens text NOT NULL,
  stakeholder_score numeric DEFAULT NULL,
  relevant_parameters jsonb DEFAULT '[]'::jsonb,
  relevant_insights jsonb DEFAULT '[]'::jsonb,
  executive_summary text DEFAULT NULL,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_stale boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  UNIQUE(report_id, stakeholder_lens)
);

-- Enable RLS
ALTER TABLE public.stakeholder_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for stakeholder_reports
CREATE POLICY "Users can view stakeholder reports in their org" 
ON public.stakeholder_reports 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM reports r
  JOIN scripts s ON s.id = r.script_id
  WHERE r.id = stakeholder_reports.report_id 
  AND user_belongs_to_org(auth.uid(), s.organization_id)
));

CREATE POLICY "Org members can insert stakeholder reports" 
ON public.stakeholder_reports 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM reports r
  JOIN scripts s ON s.id = r.script_id
  WHERE r.id = stakeholder_reports.report_id 
  AND user_belongs_to_org(auth.uid(), s.organization_id)
));

CREATE POLICY "Org members can update stakeholder reports" 
ON public.stakeholder_reports 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM reports r
  JOIN scripts s ON s.id = r.script_id
  WHERE r.id = stakeholder_reports.report_id 
  AND user_belongs_to_org(auth.uid(), s.organization_id)
));

-- Add comment for documentation
COMMENT ON TABLE public.stakeholder_reports IS 'Cached stakeholder-specific report views, generated on demand';