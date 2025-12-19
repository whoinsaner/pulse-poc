-- Fix 1: Profiles table - restrict SELECT to own profile only (remove org-wide visibility)
DROP POLICY IF EXISTS "Users can view profiles in their orgs" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (user_id = auth.uid());

-- Fix 2: Invitations table - restrict SELECT to admins only (not all org members)
DROP POLICY IF EXISTS "Users can view invitations for their orgs" ON public.invitations;

CREATE POLICY "Admins can view invitations for their orgs"
ON public.invitations
FOR SELECT
USING (has_role(auth.uid(), organization_id, 'admin'::app_role));