-- Fix RLS policies to allow syncing system agents
-- The sync framework needs to INSERT and UPDATE system agents (where is_system=true, organization_id=NULL)
-- Currently blocked by policies that require organization_id IS NOT NULL

-- Option: Allow any authenticated user to INSERT system agents (the sync utility runs client-side)
-- This is needed because system agents have organization_id = NULL

-- Drop existing restrictive INSERT policy
DROP POLICY IF EXISTS "Admins can create org agent configs" ON public.agent_configurations;

-- Create new INSERT policy that allows:
-- 1. Org admins to create org-specific configs
-- 2. Authenticated users to create system configs (for sync)
CREATE POLICY "Users can create agent configs"
ON public.agent_configurations
FOR INSERT
WITH CHECK (
  (organization_id IS NOT NULL AND has_role(auth.uid(), organization_id, 'admin'::app_role))
  OR 
  (organization_id IS NULL AND is_system = true AND auth.uid() IS NOT NULL)
);

-- Drop existing restrictive UPDATE policy  
DROP POLICY IF EXISTS "Admins can update org agent configs" ON public.agent_configurations;

-- Create new UPDATE policy that allows:
-- 1. Org admins to update org-specific configs
-- 2. Authenticated users to update system configs (for sync)
CREATE POLICY "Users can update agent configs"
ON public.agent_configurations
FOR UPDATE
USING (
  (organization_id IS NOT NULL AND has_role(auth.uid(), organization_id, 'admin'::app_role))
  OR 
  (organization_id IS NULL AND is_system = true AND auth.uid() IS NOT NULL)
);