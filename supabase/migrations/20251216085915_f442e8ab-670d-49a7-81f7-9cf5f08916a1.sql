-- Fix storage policies to properly scope by organization
-- Scripts are stored as: {organization_id}/{uuid}.{ext}

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload scripts to their org" ON storage.objects;
DROP POLICY IF EXISTS "Users can view scripts in their org" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their scripts" ON storage.objects;

-- Create properly scoped policies using the org_id in the path
CREATE POLICY "Users can upload scripts to their org"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'scripts' 
  AND user_belongs_to_org(auth.uid(), (storage.foldername(name))[1]::uuid)
);

CREATE POLICY "Users can view scripts in their org"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'scripts' 
  AND user_belongs_to_org(auth.uid(), (storage.foldername(name))[1]::uuid)
);

CREATE POLICY "Admins can delete scripts in their org"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'scripts' 
  AND has_role(auth.uid(), (storage.foldername(name))[1]::uuid, 'admin'::app_role)
);