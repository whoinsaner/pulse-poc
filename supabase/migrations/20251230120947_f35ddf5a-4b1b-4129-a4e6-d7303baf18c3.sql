-- Add quality_mode column to analysis_runs
ALTER TABLE analysis_runs 
ADD COLUMN IF NOT EXISTS quality_mode text DEFAULT 'balanced';

-- Create model_configurations table
CREATE TABLE IF NOT EXISTS model_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_default boolean DEFAULT false,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, name)
);

-- Create agent_model_mappings table
CREATE TABLE IF NOT EXISTS agent_model_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id uuid REFERENCES model_configurations(id) ON DELETE CASCADE,
  agent_name text NOT NULL,
  model text NOT NULL,
  max_retries integer DEFAULT 3,
  retry_delay_ms integer DEFAULT 2000,
  temperature numeric DEFAULT null,
  created_at timestamptz DEFAULT now(),
  UNIQUE(config_id, agent_name)
);

-- Enable RLS
ALTER TABLE model_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_model_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for model_configurations
CREATE POLICY "Users can view system configs and their org configs"
ON model_configurations FOR SELECT
USING (is_system = true OR user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Admins can create org configs"
ON model_configurations FOR INSERT
WITH CHECK (organization_id IS NOT NULL AND has_role(auth.uid(), organization_id, 'admin'::app_role));

CREATE POLICY "Admins can update org configs"
ON model_configurations FOR UPDATE
USING (organization_id IS NOT NULL AND has_role(auth.uid(), organization_id, 'admin'::app_role));

CREATE POLICY "Admins can delete org configs"
ON model_configurations FOR DELETE
USING (is_system = false AND organization_id IS NOT NULL AND has_role(auth.uid(), organization_id, 'admin'::app_role));

-- RLS Policies for agent_model_mappings
CREATE POLICY "Users can view mappings for accessible configs"
ON agent_model_mappings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM model_configurations mc 
  WHERE mc.id = agent_model_mappings.config_id 
  AND (mc.is_system = true OR user_belongs_to_org(auth.uid(), mc.organization_id))
));

CREATE POLICY "Admins can manage mappings for their org configs"
ON agent_model_mappings FOR ALL
USING (EXISTS (
  SELECT 1 FROM model_configurations mc 
  WHERE mc.id = agent_model_mappings.config_id 
  AND mc.organization_id IS NOT NULL
  AND has_role(auth.uid(), mc.organization_id, 'admin'::app_role)
));

-- Insert system preset configurations (null org_id = system-wide)
INSERT INTO model_configurations (id, organization_id, name, description, is_default, is_system) VALUES
  ('00000000-0000-0000-0000-000000000001', null, 'fast', 'Fastest analysis using lightweight models. Best for quick feedback.', false, true),
  ('00000000-0000-0000-0000-000000000002', null, 'balanced', 'Balanced speed and quality. Recommended for most scripts.', true, true),
  ('00000000-0000-0000-0000-000000000003', null, 'quality', 'Highest quality analysis using premium models. Best for final reviews.', false, true)
ON CONFLICT DO NOTHING;

-- Define all UASF agents
-- Fast Mode: All flash-lite
INSERT INTO agent_model_mappings (config_id, agent_name, model, max_retries, retry_delay_ms) VALUES
  ('00000000-0000-0000-0000-000000000001', 'ConceptHookAgent', 'google/gemini-2.5-flash-lite', 3, 1500),
  ('00000000-0000-0000-0000-000000000001', 'StructureAgent', 'google/gemini-2.5-flash-lite', 3, 1500),
  ('00000000-0000-0000-0000-000000000001', 'CharacterAgent', 'google/gemini-2.5-flash-lite', 3, 1500),
  ('00000000-0000-0000-0000-000000000001', 'DialogueAgent', 'google/gemini-2.5-flash-lite', 3, 1500),
  ('00000000-0000-0000-0000-000000000001', 'ThemeAgent', 'google/gemini-2.5-flash-lite', 3, 1500),
  ('00000000-0000-0000-0000-000000000001', 'EmotionalArcAgent', 'google/gemini-2.5-flash-lite', 3, 1500),
  ('00000000-0000-0000-0000-000000000001', 'MarketAgent', 'google/gemini-2.5-flash-lite', 3, 1500),
  ('00000000-0000-0000-0000-000000000001', 'ProductionAgent', 'google/gemini-2.5-flash-lite', 3, 1500),
  ('00000000-0000-0000-0000-000000000001', 'InsightSynthesisAgent', 'google/gemini-2.5-flash', 3, 2000)
ON CONFLICT DO NOTHING;

-- Balanced Mode: Complex agents get flash, simple get flash-lite, synthesis gets pro
INSERT INTO agent_model_mappings (config_id, agent_name, model, max_retries, retry_delay_ms) VALUES
  ('00000000-0000-0000-0000-000000000002', 'ConceptHookAgent', 'google/gemini-2.5-flash-lite', 3, 1500),
  ('00000000-0000-0000-0000-000000000002', 'StructureAgent', 'google/gemini-2.5-flash-lite', 3, 1500),
  ('00000000-0000-0000-0000-000000000002', 'CharacterAgent', 'google/gemini-2.5-flash', 3, 2000),
  ('00000000-0000-0000-0000-000000000002', 'DialogueAgent', 'google/gemini-2.5-flash', 3, 2000),
  ('00000000-0000-0000-0000-000000000002', 'ThemeAgent', 'google/gemini-2.5-flash', 3, 2000),
  ('00000000-0000-0000-0000-000000000002', 'EmotionalArcAgent', 'google/gemini-2.5-flash', 3, 2000),
  ('00000000-0000-0000-0000-000000000002', 'MarketAgent', 'google/gemini-2.5-flash-lite', 3, 1500),
  ('00000000-0000-0000-0000-000000000002', 'ProductionAgent', 'google/gemini-2.5-flash-lite', 3, 1500),
  ('00000000-0000-0000-0000-000000000002', 'InsightSynthesisAgent', 'google/gemini-2.5-pro', 3, 3000)
ON CONFLICT DO NOTHING;

-- Quality Mode: Complex agents get pro, simple get flash, synthesis gets pro
INSERT INTO agent_model_mappings (config_id, agent_name, model, max_retries, retry_delay_ms) VALUES
  ('00000000-0000-0000-0000-000000000003', 'ConceptHookAgent', 'google/gemini-2.5-flash', 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'StructureAgent', 'google/gemini-2.5-flash', 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'CharacterAgent', 'google/gemini-2.5-pro', 3, 3000),
  ('00000000-0000-0000-0000-000000000003', 'DialogueAgent', 'google/gemini-2.5-pro', 3, 3000),
  ('00000000-0000-0000-0000-000000000003', 'ThemeAgent', 'google/gemini-2.5-pro', 3, 3000),
  ('00000000-0000-0000-0000-000000000003', 'EmotionalArcAgent', 'google/gemini-2.5-pro', 3, 3000),
  ('00000000-0000-0000-0000-000000000003', 'MarketAgent', 'google/gemini-2.5-flash', 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'ProductionAgent', 'google/gemini-2.5-flash', 3, 2000),
  ('00000000-0000-0000-0000-000000000003', 'InsightSynthesisAgent', 'google/gemini-2.5-pro', 3, 3000)
ON CONFLICT DO NOTHING;

-- Add updated_at trigger for model_configurations
CREATE TRIGGER update_model_configurations_updated_at
BEFORE UPDATE ON model_configurations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();