-- Insert 13 Web Series parameters
INSERT INTO public.parameters (name, display_name, category, agent_source, description, default_weight) VALUES
-- Core Web Series Parameters (10)
('hook_efficiency', 'Hook Efficiency', 'Web Series', 'WebSeriesAgent', 'First 30 seconds viewer capture and retention triggers. Critical for algorithmic discovery and preventing scroll-past.', 1.6),
('episode_self_containment', 'Episode Self-Containment', 'Web Series', 'WebSeriesAgent', 'Balance between standalone value and serialized dependency. Each episode must work as an entry point while contributing to series arc.', 1.0),
('serial_momentum', 'Serial Momentum', 'Web Series', 'WebSeriesAgent', 'Narrative thrust driving next-episode clicks. The "one more episode" factor that drives binge behavior and return viewing.', 1.2),
('retention_curve_design', 'Retention Curve Design', 'Web Series', 'WebSeriesAgent', 'Viewer engagement maintenance throughout episode runtime. Strategic pacing to prevent drop-off at known abandon points.', 1.4),
('character_stickiness', 'Character Stickiness', 'Web Series', 'WebSeriesAgent', 'Audience attachment to recurring characters that drives return viewing. Characters worth following across multiple episodes.', 1.0),
('platform_native_storytelling', 'Platform-Native Storytelling', 'Web Series', 'WebSeriesAgent', 'Awareness of digital platform grammar and viewing context. Mobile-first formatting, comment-bait moments, shareable segments.', 0.9),
('tonality_format_consistency', 'Tonality & Format Consistency', 'Web Series', 'WebSeriesAgent', 'Episode-to-episode tonal coherence. Audience knows what to expect while still being surprised.', 0.7),
('production_simplicity_velocity', 'Production Simplicity & Velocity', 'Web Series', 'WebSeriesAgent', 'Sustainable production cadence balance. Can the series be produced at the pace platform algorithms reward?', 0.6),
('shareability_meme_potential', 'Shareability & Meme Potential', 'Web Series', 'WebSeriesAgent', 'Social media amplification hooks. Moments designed for clips, quotes, reaction GIFs, and organic sharing.', 0.8),
('monetization_readiness', 'Monetization Readiness', 'Web Series', 'WebSeriesAgent', 'Ad-supported or hybrid revenue model fit. Natural ad break points, brand-safe content, sponsorship integration potential.', 0.8),
-- Long-Form Only Parameters (3)
('mid_episode_rehooking', 'Mid-Episode Re-Hooking', 'Web Series', 'WebSeriesAgent', 'Attention reset points every 12-15 minutes for long-form episodes. Required when runtime exceeds 45 minutes.', 0.6),
('soft_act_integrity', 'Soft Act Integrity', 'Web Series', 'WebSeriesAgent', 'Internal act-like pivots without broadcast rigidity. Natural story breathing points that feel organic, not commercial-break forced.', 0.7),
('binge_continuity_pressure', 'Binge Continuity Pressure', 'Web Series', 'WebSeriesAgent', 'Episode endings that drive next-click behavior in binge-watch context. Different from weekly release hooks.', 0.6);

-- Insert lens weights for all 13 Web Series parameters across all 9 stakeholder lenses
-- Get the parameter IDs and insert weights with stakeholder-appropriate values

-- Studio Executive lens weights
INSERT INTO public.lens_weights (parameter_id, lens, weight)
SELECT id, 'studio_executive', CASE 
  WHEN name = 'hook_efficiency' THEN 1.2
  WHEN name = 'retention_curve_design' THEN 1.3
  WHEN name = 'serial_momentum' THEN 1.1
  WHEN name = 'monetization_readiness' THEN 1.4
  WHEN name = 'shareability_meme_potential' THEN 1.1
  ELSE 1.0
END FROM public.parameters WHERE agent_source = 'WebSeriesAgent';

-- Producer lens weights
INSERT INTO public.lens_weights (parameter_id, lens, weight)
SELECT id, 'producer', CASE 
  WHEN name = 'production_simplicity_velocity' THEN 1.5
  WHEN name = 'monetization_readiness' THEN 1.3
  WHEN name = 'tonality_format_consistency' THEN 1.2
  WHEN name = 'mid_episode_rehooking' THEN 1.1
  ELSE 1.0
END FROM public.parameters WHERE agent_source = 'WebSeriesAgent';

-- Director lens weights
INSERT INTO public.lens_weights (parameter_id, lens, weight)
SELECT id, 'director', CASE 
  WHEN name = 'retention_curve_design' THEN 1.3
  WHEN name = 'platform_native_storytelling' THEN 1.2
  WHEN name = 'soft_act_integrity' THEN 1.4
  WHEN name = 'tonality_format_consistency' THEN 1.2
  ELSE 1.0
END FROM public.parameters WHERE agent_source = 'WebSeriesAgent';

-- Writer lens weights  
INSERT INTO public.lens_weights (parameter_id, lens, weight)
SELECT id, 'writer', CASE 
  WHEN name = 'serial_momentum' THEN 1.4
  WHEN name = 'character_stickiness' THEN 1.5
  WHEN name = 'episode_self_containment' THEN 1.3
  WHEN name = 'binge_continuity_pressure' THEN 1.2
  WHEN name = 'soft_act_integrity' THEN 1.3
  ELSE 1.0
END FROM public.parameters WHERE agent_source = 'WebSeriesAgent';

-- Actor lens weights
INSERT INTO public.lens_weights (parameter_id, lens, weight)
SELECT id, 'actor', CASE 
  WHEN name = 'character_stickiness' THEN 1.5
  WHEN name = 'tonality_format_consistency' THEN 1.2
  WHEN name = 'serial_momentum' THEN 1.1
  ELSE 1.0
END FROM public.parameters WHERE agent_source = 'WebSeriesAgent';

-- Financier lens weights
INSERT INTO public.lens_weights (parameter_id, lens, weight)
SELECT id, 'financier', CASE 
  WHEN name = 'monetization_readiness' THEN 1.5
  WHEN name = 'production_simplicity_velocity' THEN 1.4
  WHEN name = 'shareability_meme_potential' THEN 1.2
  WHEN name = 'hook_efficiency' THEN 1.1
  ELSE 1.0
END FROM public.parameters WHERE agent_source = 'WebSeriesAgent';

-- OTT Platform lens weights
INSERT INTO public.lens_weights (parameter_id, lens, weight)
SELECT id, 'ott_platform', CASE 
  WHEN name = 'hook_efficiency' THEN 1.5
  WHEN name = 'retention_curve_design' THEN 1.5
  WHEN name = 'shareability_meme_potential' THEN 1.4
  WHEN name = 'serial_momentum' THEN 1.3
  WHEN name = 'platform_native_storytelling' THEN 1.4
  WHEN name = 'binge_continuity_pressure' THEN 1.3
  ELSE 1.0
END FROM public.parameters WHERE agent_source = 'WebSeriesAgent';

-- Theatrical lens weights (lower priority for web series metrics)
INSERT INTO public.lens_weights (parameter_id, lens, weight)
SELECT id, 'theatrical', CASE 
  WHEN name = 'character_stickiness' THEN 1.1
  WHEN name = 'serial_momentum' THEN 1.1
  WHEN name = 'soft_act_integrity' THEN 1.2
  ELSE 0.8
END FROM public.parameters WHERE agent_source = 'WebSeriesAgent';

-- Investor lens weights
INSERT INTO public.lens_weights (parameter_id, lens, weight)
SELECT id, 'investor', CASE 
  WHEN name = 'monetization_readiness' THEN 1.5
  WHEN name = 'hook_efficiency' THEN 1.3
  WHEN name = 'retention_curve_design' THEN 1.3
  WHEN name = 'production_simplicity_velocity' THEN 1.2
  WHEN name = 'shareability_meme_potential' THEN 1.3
  ELSE 1.0
END FROM public.parameters WHERE agent_source = 'WebSeriesAgent';