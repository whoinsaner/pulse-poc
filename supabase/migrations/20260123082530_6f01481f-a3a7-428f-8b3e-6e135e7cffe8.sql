-- Create agent_prompt_versions table to track version history
CREATE TABLE public.agent_prompt_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_config_id UUID NOT NULL REFERENCES public.agent_configurations(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  display_name TEXT NOT NULL,
  description TEXT,
  parameters TEXT[] NOT NULL DEFAULT '{}',
  system_prompt TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  change_summary TEXT
);

-- Create index for faster lookups
CREATE INDEX idx_agent_prompt_versions_agent_config ON public.agent_prompt_versions(agent_config_id);
CREATE INDEX idx_agent_prompt_versions_created_at ON public.agent_prompt_versions(created_at DESC);

-- Enable RLS
ALTER TABLE public.agent_prompt_versions ENABLE ROW LEVEL SECURITY;

-- RLS policies: Users can view versions for configs they can access
CREATE POLICY "Users can view versions for accessible configs"
ON public.agent_prompt_versions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM agent_configurations ac
    WHERE ac.id = agent_prompt_versions.agent_config_id
    AND (ac.is_system = true OR user_belongs_to_org(auth.uid(), ac.organization_id))
  )
);

-- Users can insert versions for configs they can edit
CREATE POLICY "Admins can insert versions for org configs"
ON public.agent_prompt_versions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM agent_configurations ac
    WHERE ac.id = agent_prompt_versions.agent_config_id
    AND (
      (ac.organization_id IS NOT NULL AND has_role(auth.uid(), ac.organization_id, 'admin'))
      OR ac.is_system = true
    )
  )
);