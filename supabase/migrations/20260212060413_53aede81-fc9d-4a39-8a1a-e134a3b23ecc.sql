INSERT INTO public.parameters (name, display_name, description, category, agent_source, default_weight)
VALUES
  ('panel_economy', 'Panel Economy', 'Efficient use of panels with no wasted or redundant panels diluting impact', 'Comic Visuals', 'PanelFlowAgent', 1.0),
  ('dialogue_load', 'Dialogue Load', 'Appropriate dialogue density per page avoiding overcrowded panels', 'Comic Dialogue', 'LetteringBalloonAgent', 1.0),
  ('balloon_engineering', 'Balloon Engineering', 'Strategic balloon placement, sizing, and tail direction for readability', 'Comic Dialogue', 'LetteringBalloonAgent', 1.0),
  ('reading_flow', 'Reading Flow', 'Natural eye-path guiding readers within and across panels', 'Comic Dialogue', 'LetteringBalloonAgent', 1.0),
  ('emotional_payload_per_page', 'Emotional Payload', 'Emotional impact density and weight distribution across pages', 'Comic Pacing', 'PageTurnImpactAgent', 1.0),
  ('character_visual_identity', 'Character Visual Identity', 'Distinct, memorable visual cues scripted for each character', 'Comic Art Direction', 'ArtScriptSynergyAgent', 1.0);