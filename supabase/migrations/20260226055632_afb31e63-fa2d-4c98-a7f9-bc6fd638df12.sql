-- Parser settings table for configurable parser parameters
CREATE TABLE public.parser_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  label text NOT NULL,
  description text,
  value_type text NOT NULL DEFAULT 'number',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.parser_settings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view
CREATE POLICY "Authenticated users can view parser settings"
  ON public.parser_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Admins can manage
CREATE POLICY "Admins can insert parser settings"
  ON public.parser_settings FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can update parser settings"
  ON public.parser_settings FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete parser settings"
  ON public.parser_settings FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Seed with dialogue threshold defaults
INSERT INTO public.parser_settings (key, value, label, description, value_type) VALUES
  ('dialogue_strict_threshold', '2', 'Strict Dialogue Threshold', 'Minimum dialogue lines required for a character to be extracted. Characters below this are filtered out.', 'number'),
  ('dialogue_fallback_threshold', '1', 'Fallback Dialogue Threshold', 'If strict filtering leaves fewer than the minimum character count, this relaxed threshold is used instead.', 'number'),
  ('min_characters_for_strict', '3', 'Minimum Characters for Strict Mode', 'If strict filtering produces fewer characters than this number, the parser falls back to the relaxed threshold.', 'number'),
  ('short_name_max_length', '3', 'Short Name Max Length', 'Single-word character names with this many characters or fewer are automatically rejected.', 'number')
ON CONFLICT (key) DO NOTHING;