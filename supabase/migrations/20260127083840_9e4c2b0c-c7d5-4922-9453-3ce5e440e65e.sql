-- Add columns for stakeholder-adaptive content
ALTER TABLE public.stakeholder_reports
ADD COLUMN IF NOT EXISTS adapted_insights jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS adapted_recommendations jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS key_metrics jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS vocabulary_version text DEFAULT '1.0.0';

-- Add index for faster lookup of adapted content
CREATE INDEX IF NOT EXISTS idx_stakeholder_reports_adapted 
ON public.stakeholder_reports(report_id, stakeholder_lens) 
WHERE adapted_insights IS NOT NULL;

-- Add comment explaining the new columns
COMMENT ON COLUMN public.stakeholder_reports.adapted_insights IS 'AI-reframed insights using stakeholder-specific vocabulary';
COMMENT ON COLUMN public.stakeholder_reports.adapted_recommendations IS 'Role-specific action items and recommendations';
COMMENT ON COLUMN public.stakeholder_reports.key_metrics IS 'Stakeholder-relevant data points (e.g., Actor: screen time, dialogue %)';
COMMENT ON COLUMN public.stakeholder_reports.vocabulary_version IS 'Version of vocabulary map used for adaptation';