-- Create function to accept invitations
CREATE OR REPLACE FUNCTION public.accept_invitation(p_token text, p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation invitations%ROWTYPE;
  v_result jsonb;
BEGIN
  -- Validate token and get invitation
  SELECT * INTO v_invitation 
  FROM invitations 
  WHERE token = p_token 
    AND expires_at > now() 
    AND accepted_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid or expired invitation'
    );
  END IF;
  
  -- Check if user already has a role in this organization
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = p_user_id 
    AND organization_id = v_invitation.organization_id
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'You are already a member of this organization'
    );
  END IF;
  
  -- Create user role
  INSERT INTO user_roles (user_id, organization_id, role)
  VALUES (p_user_id, v_invitation.organization_id, v_invitation.role);
  
  -- Mark invitation as accepted
  UPDATE invitations 
  SET accepted_at = now() 
  WHERE id = v_invitation.id;
  
  -- Set current org for user if they don't have one
  UPDATE profiles 
  SET current_organization_id = v_invitation.organization_id 
  WHERE user_id = p_user_id 
    AND current_organization_id IS NULL;
  
  RETURN jsonb_build_object(
    'success', true,
    'organization_id', v_invitation.organization_id,
    'role', v_invitation.role
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.accept_invitation(text, uuid) TO authenticated;