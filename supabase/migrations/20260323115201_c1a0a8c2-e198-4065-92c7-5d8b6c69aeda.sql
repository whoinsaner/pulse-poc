-- Fix infinite recursion between report_shares and reports RLS policies
-- The issue: reports SELECT checks report_shares, and report_shares SELECT checks reports

-- Step 1: Create a security definer function to check report org membership
-- This bypasses RLS and breaks the recursion cycle
CREATE OR REPLACE FUNCTION public.get_report_org_id(_report_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT organization_id FROM public.reports WHERE id = _report_id
$$;

-- Step 2: Drop the recursive report_shares SELECT policy
DROP POLICY IF EXISTS "Users can view own or org report shares" ON public.report_shares;

-- Step 3: Recreate report_shares SELECT policy using the security definer function
-- instead of directly joining to reports (which would trigger reports RLS → report_shares RLS → loop)
CREATE POLICY "Users can view own or org report shares"
ON public.report_shares FOR SELECT
TO authenticated
USING (
  created_by = auth.uid()
  OR user_belongs_to_org(auth.uid(), get_report_org_id(report_id))
);

-- Step 4: Also fix the report_shares UPDATE and DELETE policies (same recursion issue)
DROP POLICY IF EXISTS "Creators and admins can update shares" ON public.report_shares;
CREATE POLICY "Creators and admins can update shares"
ON public.report_shares FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid()
  OR has_role(auth.uid(), get_report_org_id(report_id), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Creators and admins can delete shares" ON public.report_shares;
CREATE POLICY "Creators and admins can delete shares"
ON public.report_shares FOR DELETE
TO authenticated
USING (
  created_by = auth.uid()
  OR has_role(auth.uid(), get_report_org_id(report_id), 'admin'::app_role)
);

-- Step 5: Fix the INSERT policy too
DROP POLICY IF EXISTS "Org members can create report shares" ON public.report_shares;
CREATE POLICY "Org members can create report shares"
ON public.report_shares FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), get_report_org_id(report_id), 'admin'::app_role)
  OR has_role(auth.uid(), get_report_org_id(report_id), 'analyst'::app_role)
);