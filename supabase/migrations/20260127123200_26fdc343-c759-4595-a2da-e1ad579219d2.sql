-- Fix exposed configuration tables by requiring authentication
-- Issue 1: agent_configurations - Remove public access to system configs
-- Issue 2: agent_model_mappings - Restrict to authenticated org members  
-- Issue 3: model_configurations - Restrict to authenticated users

-- 1. Fix agent_configurations: Drop the overly permissive system config policy
DROP POLICY IF EXISTS "Users can view system agent configs" ON public.agent_configurations;

-- Create a new policy that requires authentication for system configs
CREATE POLICY "Authenticated users can view system agent configs"
ON public.agent_configurations
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND is_system = true
);

-- 2. Fix agent_model_mappings: The current policy allows viewing if config is system or user belongs to org
-- Drop and recreate to require authentication
DROP POLICY IF EXISTS "Users can view mappings for accessible configs" ON public.agent_model_mappings;

CREATE POLICY "Authenticated users can view mappings for accessible configs"
ON public.agent_model_mappings
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM model_configurations mc
    WHERE mc.id = agent_model_mappings.config_id 
    AND (mc.is_system = true OR user_belongs_to_org(auth.uid(), mc.organization_id))
  )
);

-- 3. Fix model_configurations: Drop and recreate to require authentication
DROP POLICY IF EXISTS "Users can view system configs and their org configs" ON public.model_configurations;

CREATE POLICY "Authenticated users can view system and org configs"
ON public.model_configurations
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (is_system = true OR user_belongs_to_org(auth.uid(), organization_id))
);