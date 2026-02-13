-- Audit trail for model configuration changes
CREATE TABLE public.model_config_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID NOT NULL REFERENCES public.model_configurations(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL,
  change_type TEXT NOT NULL, -- 'model_change', 'temperature_change', 'bulk_save'
  agent_name TEXT,
  old_value JSONB,
  new_value JSONB,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.model_config_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins in the org can view audit logs for their configs
CREATE POLICY "Users can view audit logs for accessible configs"
ON public.model_config_audit_log
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM model_configurations mc
    WHERE mc.id = model_config_audit_log.config_id
    AND (mc.is_system = true OR user_belongs_to_org(auth.uid(), mc.organization_id))
  )
);

-- Authenticated users can insert audit logs
CREATE POLICY "Authenticated users can insert audit logs"
ON public.model_config_audit_log
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND changed_by = auth.uid());

-- Allow admins to manage system config mappings
-- Update the existing RLS on agent_model_mappings to also allow system config edits by admins
CREATE POLICY "Admins can manage system config mappings"
ON public.agent_model_mappings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM model_configurations mc
    WHERE mc.id = agent_model_mappings.config_id
    AND mc.is_system = true
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM model_configurations mc
    WHERE mc.id = agent_model_mappings.config_id
    AND mc.is_system = true
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  )
);