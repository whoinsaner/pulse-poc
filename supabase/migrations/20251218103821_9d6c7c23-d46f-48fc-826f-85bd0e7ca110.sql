-- Add lens weights for all new UASF parameters across all 8 stakeholder lenses
-- Weights are normalized 0.5-1.5 where 1.0 is neutral, <1 is less important, >1 is more important

-- First, get all parameter IDs from the parameters table and insert weights
-- Studio Executive weights (focuses on marketability, execution, concept)
INSERT INTO public.lens_weights (lens, parameter_id, weight)
SELECT 'studio_executive'::stakeholder_lens, p.id,
  CASE 
    -- High priority for Studio Executive
    WHEN p.category = 'Concept & Hook' THEN 1.4
    WHEN p.category = 'Market' THEN 1.5
    WHEN p.category = 'Execution' THEN 1.3
    WHEN p.category = 'Structure' THEN 1.1
    -- Medium priority
    WHEN p.category = 'Conflict' THEN 1.0
    WHEN p.category = 'Theme' THEN 0.9
    -- Lower priority
    WHEN p.category = 'Character' THEN 0.9
    WHEN p.category = 'Dialogue' THEN 0.8
    WHEN p.category = 'World & Logic' THEN 0.9
    WHEN p.category = 'Emotional Arc' THEN 0.8
    -- Comic categories
    WHEN p.category LIKE 'Comic%' THEN 1.0
    ELSE 1.0
  END
FROM public.parameters p
WHERE NOT EXISTS (
  SELECT 1 FROM public.lens_weights lw 
  WHERE lw.parameter_id = p.id AND lw.lens = 'studio_executive'
);

-- Producer weights (focuses on execution, budget complexity, feasibility)
INSERT INTO public.lens_weights (lens, parameter_id, weight)
SELECT 'producer'::stakeholder_lens, p.id,
  CASE 
    WHEN p.category = 'Execution' THEN 1.5
    WHEN p.category = 'World & Logic' THEN 1.3
    WHEN p.category = 'Market' THEN 1.2
    WHEN p.category = 'Structure' THEN 1.1
    WHEN p.category = 'Concept & Hook' THEN 1.1
    WHEN p.category = 'Character' THEN 1.0
    WHEN p.category = 'Conflict' THEN 0.9
    WHEN p.category = 'Theme' THEN 0.8
    WHEN p.category = 'Dialogue' THEN 0.9
    WHEN p.category = 'Emotional Arc' THEN 0.8
    WHEN p.category LIKE 'Comic%' THEN 1.0
    ELSE 1.0
  END
FROM public.parameters p
WHERE NOT EXISTS (
  SELECT 1 FROM public.lens_weights lw 
  WHERE lw.parameter_id = p.id AND lw.lens = 'producer'
);

-- Actor weights (focuses on character depth, dialogue, emotional arc)
INSERT INTO public.lens_weights (lens, parameter_id, weight)
SELECT 'actor'::stakeholder_lens, p.id,
  CASE 
    WHEN p.category = 'Character' THEN 1.5
    WHEN p.category = 'Dialogue' THEN 1.4
    WHEN p.category = 'Emotional Arc' THEN 1.3
    WHEN p.category = 'Conflict' THEN 1.1
    WHEN p.category = 'Theme' THEN 1.0
    WHEN p.category = 'Structure' THEN 0.9
    WHEN p.category = 'Concept & Hook' THEN 0.8
    WHEN p.category = 'Market' THEN 0.7
    WHEN p.category = 'Execution' THEN 0.7
    WHEN p.category = 'World & Logic' THEN 0.9
    WHEN p.category LIKE 'Comic%' THEN 0.8
    ELSE 1.0
  END
FROM public.parameters p
WHERE NOT EXISTS (
  SELECT 1 FROM public.lens_weights lw 
  WHERE lw.parameter_id = p.id AND lw.lens = 'actor'
);

-- Director weights (focuses on structure, world, emotional arc, visuals)
INSERT INTO public.lens_weights (lens, parameter_id, weight)
SELECT 'director'::stakeholder_lens, p.id,
  CASE 
    WHEN p.category = 'Structure' THEN 1.4
    WHEN p.category = 'World & Logic' THEN 1.3
    WHEN p.category = 'Emotional Arc' THEN 1.3
    WHEN p.category = 'Conflict' THEN 1.2
    WHEN p.category = 'Character' THEN 1.1
    WHEN p.category = 'Theme' THEN 1.1
    WHEN p.category = 'Dialogue' THEN 1.0
    WHEN p.category = 'Concept & Hook' THEN 0.9
    WHEN p.category = 'Market' THEN 0.7
    WHEN p.category = 'Execution' THEN 1.0
    -- Comic directors care about visual storytelling
    WHEN p.category = 'Comic Visuals' THEN 1.5
    WHEN p.category = 'Comic Pacing' THEN 1.3
    WHEN p.category = 'Comic Art Direction' THEN 1.4
    WHEN p.category = 'Comic Dialogue' THEN 1.0
    ELSE 1.0
  END
FROM public.parameters p
WHERE NOT EXISTS (
  SELECT 1 FROM public.lens_weights lw 
  WHERE lw.parameter_id = p.id AND lw.lens = 'director'
);

-- Writer weights (focuses on craft: structure, character, dialogue, theme)
INSERT INTO public.lens_weights (lens, parameter_id, weight)
SELECT 'writer'::stakeholder_lens, p.id,
  CASE 
    WHEN p.category = 'Structure' THEN 1.4
    WHEN p.category = 'Character' THEN 1.4
    WHEN p.category = 'Dialogue' THEN 1.4
    WHEN p.category = 'Theme' THEN 1.3
    WHEN p.category = 'Conflict' THEN 1.2
    WHEN p.category = 'Emotional Arc' THEN 1.1
    WHEN p.category = 'World & Logic' THEN 1.1
    WHEN p.category = 'Concept & Hook' THEN 1.0
    WHEN p.category = 'Market' THEN 0.6
    WHEN p.category = 'Execution' THEN 0.6
    WHEN p.category LIKE 'Comic%' THEN 1.1
    ELSE 1.0
  END
FROM public.parameters p
WHERE NOT EXISTS (
  SELECT 1 FROM public.lens_weights lw 
  WHERE lw.parameter_id = p.id AND lw.lens = 'writer'
);

-- Financier weights (focuses on market, execution risk, concept)
INSERT INTO public.lens_weights (lens, parameter_id, weight)
SELECT 'financier'::stakeholder_lens, p.id,
  CASE 
    WHEN p.category = 'Market' THEN 1.5
    WHEN p.category = 'Execution' THEN 1.4
    WHEN p.category = 'Concept & Hook' THEN 1.3
    WHEN p.category = 'Structure' THEN 1.0
    WHEN p.category = 'Character' THEN 0.9
    WHEN p.category = 'Conflict' THEN 0.9
    WHEN p.category = 'Theme' THEN 0.8
    WHEN p.category = 'Dialogue' THEN 0.7
    WHEN p.category = 'World & Logic' THEN 1.0
    WHEN p.category = 'Emotional Arc' THEN 0.8
    WHEN p.category LIKE 'Comic%' THEN 1.0
    ELSE 1.0
  END
FROM public.parameters p
WHERE NOT EXISTS (
  SELECT 1 FROM public.lens_weights lw 
  WHERE lw.parameter_id = p.id AND lw.lens = 'financier'
);

-- OTT Platform weights (focuses on binge-ability, emotional arc, cliffhangers)
INSERT INTO public.lens_weights (lens, parameter_id, weight)
SELECT 'ott_platform'::stakeholder_lens, p.id,
  CASE 
    WHEN p.category = 'Emotional Arc' THEN 1.4
    WHEN p.category = 'Structure' THEN 1.3
    WHEN p.category = 'Market' THEN 1.3
    WHEN p.category = 'Concept & Hook' THEN 1.2
    WHEN p.category = 'Character' THEN 1.2
    WHEN p.category = 'Conflict' THEN 1.1
    WHEN p.category = 'Dialogue' THEN 1.0
    WHEN p.category = 'Theme' THEN 0.9
    WHEN p.category = 'World & Logic' THEN 1.0
    WHEN p.category = 'Execution' THEN 1.1
    WHEN p.category LIKE 'Comic%' THEN 0.9
    ELSE 1.0
  END
FROM public.parameters p
WHERE NOT EXISTS (
  SELECT 1 FROM public.lens_weights lw 
  WHERE lw.parameter_id = p.id AND lw.lens = 'ott_platform'
);

-- Theatrical weights (focuses on spectacle, emotional impact, concept)
INSERT INTO public.lens_weights (lens, parameter_id, weight)
SELECT 'theatrical'::stakeholder_lens, p.id,
  CASE 
    WHEN p.category = 'Concept & Hook' THEN 1.4
    WHEN p.category = 'Emotional Arc' THEN 1.4
    WHEN p.category = 'World & Logic' THEN 1.3
    WHEN p.category = 'Conflict' THEN 1.2
    WHEN p.category = 'Structure' THEN 1.1
    WHEN p.category = 'Market' THEN 1.2
    WHEN p.category = 'Character' THEN 1.0
    WHEN p.category = 'Theme' THEN 1.0
    WHEN p.category = 'Dialogue' THEN 0.9
    WHEN p.category = 'Execution' THEN 1.1
    -- Comics less relevant for theatrical
    WHEN p.category LIKE 'Comic%' THEN 0.7
    ELSE 1.0
  END
FROM public.parameters p
WHERE NOT EXISTS (
  SELECT 1 FROM public.lens_weights lw 
  WHERE lw.parameter_id = p.id AND lw.lens = 'theatrical'
);