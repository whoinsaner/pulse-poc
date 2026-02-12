CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_configurations_agent_name_system 
ON public.agent_configurations (agent_name) 
WHERE is_system = true AND organization_id IS NULL;