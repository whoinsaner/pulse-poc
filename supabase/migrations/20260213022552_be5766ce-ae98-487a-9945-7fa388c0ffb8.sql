-- Optimization 5: Atomic JSONB progress update to eliminate read-then-write race conditions
CREATE OR REPLACE FUNCTION public.update_agent_progress(
  p_analysis_run_id uuid,
  p_agent_name text,
  p_status text,
  p_error text DEFAULT NULL,
  p_model text DEFAULT NULL,
  p_section_content jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_update jsonb;
BEGIN
  -- Build the update object
  v_update := jsonb_build_object('status', p_status);
  
  IF p_status = 'running' THEN
    v_update := v_update || jsonb_build_object('startedAt', to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'));
  END IF;
  
  IF p_status = 'completed' THEN
    v_update := v_update || jsonb_build_object('completedAt', to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'));
  END IF;
  
  IF p_error IS NOT NULL THEN
    v_update := v_update || jsonb_build_object('error', p_error);
  END IF;
  
  IF p_model IS NOT NULL THEN
    v_update := v_update || jsonb_build_object('model', p_model);
  END IF;
  
  IF p_section_content IS NOT NULL THEN
    v_update := v_update || jsonb_build_object('sectionContent', p_section_content);
  END IF;
  
  -- Atomic update using jsonb_set - no read required
  UPDATE analysis_runs 
  SET agent_progress = COALESCE(agent_progress, '{}'::jsonb) || jsonb_build_object(p_agent_name, 
    COALESCE(agent_progress -> p_agent_name, '{}'::jsonb) || v_update
  )
  WHERE id = p_analysis_run_id;
END;
$$;