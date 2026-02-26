
-- Create script_lines table for granular line storage
CREATE TABLE public.script_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id uuid NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  scene_number integer NOT NULL,
  line_number integer NOT NULL,
  character_name text,
  line_type text NOT NULL,
  content text NOT NULL,
  page_number integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Composite index for fast per-scene queries
CREATE INDEX idx_script_lines_lookup ON public.script_lines(script_id, scene_number);

-- Enable RLS
ALTER TABLE public.script_lines ENABLE ROW LEVEL SECURITY;

-- SELECT: org members via script join
CREATE POLICY "Org members can view script_lines via script"
  ON public.script_lines FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM scripts s
    WHERE s.id = script_lines.script_id
    AND user_belongs_to_org(auth.uid(), s.organization_id)
  ));

-- INSERT: org members via script join
CREATE POLICY "Org members can insert script_lines via script"
  ON public.script_lines FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM scripts s
    WHERE s.id = script_lines.script_id
    AND user_belongs_to_org(auth.uid(), s.organization_id)
  ));

-- DELETE: org members via script join (needed for re-parse cleanup)
CREATE POLICY "Org members can delete script_lines via script"
  ON public.script_lines FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM scripts s
    WHERE s.id = script_lines.script_id
    AND user_belongs_to_org(auth.uid(), s.organization_id)
  ));
