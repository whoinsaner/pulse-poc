
-- Drop existing overly permissive storage policies
DROP POLICY IF EXISTS "Users can upload scripts to their org" ON storage.objects;
DROP POLICY IF EXISTS "Users can view scripts in their org" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their scripts" ON storage.objects;

-- Create organization-scoped INSERT policy
CREATE POLICY "Users can upload to their org folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'scripts'
    AND (storage.foldername(name))[1] IN (
      SELECT organization_id::text
      FROM public.user_roles
      WHERE user_id = auth.uid()
    )
  );

-- Create organization-scoped SELECT policy
CREATE POLICY "Users can view their org scripts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'scripts'
    AND (storage.foldername(name))[1] IN (
      SELECT organization_id::text
      FROM public.user_roles
      WHERE user_id = auth.uid()
    )
  );

-- Create organization-scoped DELETE policy
CREATE POLICY "Users can delete scripts in their org"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'scripts'
    AND (storage.foldername(name))[1] IN (
      SELECT organization_id::text
      FROM public.user_roles
      WHERE user_id = auth.uid()
    )
  );
