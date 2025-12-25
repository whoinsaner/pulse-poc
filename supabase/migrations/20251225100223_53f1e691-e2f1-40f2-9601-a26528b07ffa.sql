-- Allow admins and analysts to delete reports in their organization
CREATE POLICY "Admins and analysts can delete reports"
ON public.reports
FOR DELETE
USING (
  has_role(auth.uid(), organization_id, 'admin'::app_role) 
  OR has_role(auth.uid(), organization_id, 'analyst'::app_role)
);