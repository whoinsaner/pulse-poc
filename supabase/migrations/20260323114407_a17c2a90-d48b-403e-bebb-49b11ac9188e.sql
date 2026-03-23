-- Create report_shares table for authenticated cross-org sharing with expiry + revoke
CREATE TABLE public.report_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(32), 'hex'),
  created_by uuid NOT NULL,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '30 days'),
  revoked_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast token lookup
CREATE INDEX idx_report_shares_token ON public.report_shares(token);
CREATE INDEX idx_report_shares_report_id ON public.report_shares(report_id);

-- Enable RLS
ALTER TABLE public.report_shares ENABLE ROW LEVEL SECURITY;

-- Org members (admin/analyst) can create shares for reports in their org
CREATE POLICY "Org members can create report shares"
ON public.report_shares
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.reports r
    WHERE r.id = report_shares.report_id
    AND (
      has_role(auth.uid(), r.organization_id, 'admin'::app_role)
      OR has_role(auth.uid(), r.organization_id, 'analyst'::app_role)
    )
  )
);

-- Creators and org admins can update (revoke) shares
CREATE POLICY "Creators and admins can update shares"
ON public.report_shares
FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.reports r
    WHERE r.id = report_shares.report_id
    AND has_role(auth.uid(), r.organization_id, 'admin'::app_role)
  )
);

-- Creators and org admins can delete shares
CREATE POLICY "Creators and admins can delete shares"
ON public.report_shares
FOR DELETE
TO authenticated
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.reports r
    WHERE r.id = report_shares.report_id
    AND has_role(auth.uid(), r.organization_id, 'admin'::app_role)
  )
);

-- Any authenticated user can SELECT shares (needed for token validation on report load)
CREATE POLICY "Authenticated users can view shares by token"
ON public.report_shares
FOR SELECT
TO authenticated
USING (true);

-- Create a SECURITY DEFINER function to check share access
-- This allows report viewing without org membership when a valid token exists
CREATE OR REPLACE FUNCTION public.has_report_share_access(_user_id uuid, _report_id uuid, _token text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.report_shares
    WHERE report_id = _report_id
      AND token = _token
      AND revoked_at IS NULL
      AND expires_at > now()
  )
$$;

-- Add a permissive SELECT policy on reports for share token access
CREATE POLICY "Shared report access via token"
ON public.reports
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.report_shares rs
    WHERE rs.report_id = reports.id
      AND rs.revoked_at IS NULL
      AND rs.expires_at > now()
  )
);