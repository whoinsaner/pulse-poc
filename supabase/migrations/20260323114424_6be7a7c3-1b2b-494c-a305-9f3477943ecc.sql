-- Replace overly permissive SELECT policy with scoped access
-- Users can see shares they created OR shares for reports in their org
DROP POLICY "Authenticated users can view shares by token" ON public.report_shares;

CREATE POLICY "Users can view own or org report shares"
ON public.report_shares
FOR SELECT
TO authenticated
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.reports r
    WHERE r.id = report_shares.report_id
    AND user_belongs_to_org(auth.uid(), r.organization_id)
  )
);