
-- 2. Fix: Remove analysis_runs from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.analysis_runs;

-- 3. Fix: Restrict system agent config UPDATE to admin-only
DROP POLICY IF EXISTS "Users can update agent configs" ON public.agent_configurations;
CREATE POLICY "Users can update agent configs" ON public.agent_configurations
FOR UPDATE USING (
  (organization_id IS NOT NULL AND has_role(auth.uid(), organization_id, 'admin'::app_role))
  OR
  (organization_id IS NULL AND is_system = true AND EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role
  ))
);

-- 3b. Fix: Also restrict system agent config INSERT to admin-only
DROP POLICY IF EXISTS "Users can create agent configs" ON public.agent_configurations;
CREATE POLICY "Users can create agent configs" ON public.agent_configurations
FOR INSERT WITH CHECK (
  (organization_id IS NOT NULL AND has_role(auth.uid(), organization_id, 'admin'::app_role))
  OR
  (organization_id IS NULL AND is_system = true AND EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role
  ))
);

-- 4. Fix: Restrict user_roles self-insert to only newly created orgs (no existing members)
DROP POLICY IF EXISTS "Users can insert their own role on org creation" ON public.user_roles;
CREATE POLICY "Users can insert their own role on org creation" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.organization_id = user_roles.organization_id
  )
);
