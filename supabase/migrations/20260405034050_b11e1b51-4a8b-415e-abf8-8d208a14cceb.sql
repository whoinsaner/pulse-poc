
-- Update model_configurations: set quality as default
UPDATE model_configurations SET is_default = true WHERE id = '00000000-0000-0000-0000-000000000003';
UPDATE model_configurations SET is_default = false WHERE id != '00000000-0000-0000-0000-000000000003';

-- Upsert agent_model_mappings for non-system agents -> gemini-3.1-pro-preview
INSERT INTO agent_model_mappings (config_id, agent_name, model, temperature, max_retries, retry_delay_ms)
VALUES
  ('00000000-0000-0000-0000-000000000003', 'ConceptAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'StructureAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'CharacterAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'ConflictAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'ThemeAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'DialogueAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'WorldLogicAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'EmotionalArcAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'MarketAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'ExecutionAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'PanelFlowAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'LetteringBalloonAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'PageTurnImpactAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'ArtScriptSynergyAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'InteractivityAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'WorldBuildingAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'AudioNarrativeAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'WebSeriesAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'MicroDramaAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'SceneEnrichmentAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'BreakdownExtractorAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'ScriptEvolutionAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'CreatorFeedbackLoopAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'ExplainabilityTraceAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'InvestorReadinessAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'SeriesBibleAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'InsightSynthesisAgent', 'google/gemini-3.1-pro-preview', 0.3, 3, 3000),
  -- System agents stay on gemini-2.5-flash
  ('00000000-0000-0000-0000-000000000003', 'IntakeNormalizerAgent', 'google/gemini-2.5-flash', 0.1, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'ScriptTypeClassifierAgent', 'google/gemini-2.5-flash', 0.1, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'ClassifierArbitrationAgent', 'google/gemini-2.5-flash', 0.1, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'MultiTypeBlendingAgent', 'google/gemini-2.5-flash', 0.1, 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'CinemaTraditionAgent', 'google/gemini-2.5-flash', 0.1, 3, 2000)
ON CONFLICT (config_id, agent_name)
DO UPDATE SET model = EXCLUDED.model, temperature = EXCLUDED.temperature, max_retries = EXCLUDED.max_retries, retry_delay_ms = EXCLUDED.retry_delay_ms;
