
-- Breakdown element categories enum
CREATE TYPE public.breakdown_category AS ENUM (
  'cast', 'extras', 'props', 'wardrobe', 'makeup', 'vehicles', 
  'animals', 'vfx', 'sfx', 'stunts', 'music', 'sound', 
  'set_dressing', 'greenery', 'special_equipment', 'notes'
);

-- Breakdown tags table - stores tagged elements per scene
CREATE TABLE public.breakdown_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scene_id UUID NOT NULL REFERENCES public.scenes(id) ON DELETE CASCADE,
  script_id UUID NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  category breakdown_category NOT NULL,
  element_name TEXT NOT NULL,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast scene lookups
CREATE INDEX idx_breakdown_tags_scene_id ON public.breakdown_tags(scene_id);
CREATE INDEX idx_breakdown_tags_script_id ON public.breakdown_tags(script_id);

-- Enable RLS
ALTER TABLE public.breakdown_tags ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view breakdown tags in their org (via script)
CREATE POLICY "Users can view breakdown tags in their org"
  ON public.breakdown_tags FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM scripts s
    WHERE s.id = breakdown_tags.script_id
    AND user_belongs_to_org(auth.uid(), s.organization_id)
  ));

-- RLS: Analysts and admins can insert breakdown tags
CREATE POLICY "Analysts and admins can insert breakdown tags"
  ON public.breakdown_tags FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM scripts s
    WHERE s.id = breakdown_tags.script_id
    AND (has_role(auth.uid(), s.organization_id, 'admin') OR has_role(auth.uid(), s.organization_id, 'analyst'))
  ));

-- RLS: Analysts and admins can update breakdown tags
CREATE POLICY "Analysts and admins can update breakdown tags"
  ON public.breakdown_tags FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM scripts s
    WHERE s.id = breakdown_tags.script_id
    AND (has_role(auth.uid(), s.organization_id, 'admin') OR has_role(auth.uid(), s.organization_id, 'analyst'))
  ));

-- RLS: Analysts and admins can delete breakdown tags
CREATE POLICY "Analysts and admins can delete breakdown tags"
  ON public.breakdown_tags FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM scripts s
    WHERE s.id = breakdown_tags.script_id
    AND (has_role(auth.uid(), s.organization_id, 'admin') OR has_role(auth.uid(), s.organization_id, 'analyst'))
  ));
