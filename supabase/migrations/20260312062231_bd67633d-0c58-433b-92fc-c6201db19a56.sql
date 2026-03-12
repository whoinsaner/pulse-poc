ALTER TABLE public.breakdown_tags 
  ADD COLUMN source text NOT NULL DEFAULT 'manual',
  ADD COLUMN confidence numeric DEFAULT NULL;