-- Insert the Tone & Genre Cohesion parameter
INSERT INTO public.parameters (id, name, display_name, description, category, agent_source, default_weight)
VALUES (
  gen_random_uuid(),
  'tone_genre_cohesion',
  'Tone & Genre Cohesion',
  'Evaluates how consistently the script maintains its tonal promises and fulfills genre expectations throughout the narrative.',
  'Theme',
  'ThemeAgent',
  1.0
);

-- Get the parameter ID and insert lens weights for all 9 stakeholders
DO $$
DECLARE
  param_id uuid;
BEGIN
  SELECT id INTO param_id FROM public.parameters WHERE name = 'tone_genre_cohesion';
  
  -- Insert lens weights with stakeholder-specific priorities
  INSERT INTO public.lens_weights (lens, parameter_id, weight) VALUES
    ('director', param_id, 1.4),      -- Directors care most about tonal craft
    ('writer', param_id, 1.3),        -- Writers need strong tonal consistency
    ('producer', param_id, 1.1),      -- Producers value marketable tone
    ('studio_executive', param_id, 1.0),
    ('actor', param_id, 1.0),
    ('ott_platform', param_id, 1.0),
    ('theatrical', param_id, 1.0),
    ('investor', param_id, 0.9),
    ('financier', param_id, 0.8);     -- Financiers weight this lower
END $$;