-- Add explicit restrictive policies to parameters table for INSERT/UPDATE/DELETE
-- Parameters are system-managed via service role, so block all user modifications

-- Create restrictive INSERT policy (no authenticated user can insert)
CREATE POLICY "No user can insert parameters"
ON public.parameters
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Create restrictive UPDATE policy (no authenticated user can update)
CREATE POLICY "No user can update parameters"
ON public.parameters
FOR UPDATE
TO authenticated
USING (false);

-- Create restrictive DELETE policy (no authenticated user can delete)
CREATE POLICY "No user can delete parameters"
ON public.parameters
FOR DELETE
TO authenticated
USING (false);