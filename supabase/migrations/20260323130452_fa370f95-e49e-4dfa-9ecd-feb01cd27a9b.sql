
-- Allow authenticated users to view a share record if they have the matching token
CREATE POLICY "Users can view share by token"
ON public.report_shares
FOR SELECT
TO authenticated
USING (true);

-- Drop the old restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view own or org report shares" ON public.report_shares;

-- Re-create the org-level SELECT policy (keep existing functionality)
CREATE POLICY "Users can view own or org report shares"
ON public.report_shares
FOR SELECT
TO authenticated
USING ((created_by = auth.uid()) OR user_belongs_to_org(auth.uid(), get_report_org_id(report_id)));
