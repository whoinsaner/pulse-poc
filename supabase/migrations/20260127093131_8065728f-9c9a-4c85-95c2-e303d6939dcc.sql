-- Fix profiles table exposure: Allow users to see profiles of members in their organizations
-- Current policy only allows viewing own profile, but for team features we need org-scoped visibility

-- Drop the existing overly restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a new policy that allows users to view:
-- 1. Their own profile (always)
-- 2. Profiles of users who are members of the same organization
CREATE POLICY "Users can view profiles in their organizations"
ON public.profiles
FOR SELECT
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur1
    INNER JOIN public.user_roles ur2 ON ur1.organization_id = ur2.organization_id
    WHERE ur1.user_id = auth.uid()
    AND ur2.user_id = profiles.user_id
  )
);