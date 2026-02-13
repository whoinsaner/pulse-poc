
-- Drop the existing SELECT policy on the invitations base table
-- so tokens are never exposed to client-side queries.
-- Admins will use the invitations_safe view (which excludes tokens).
-- The accept_invitation SECURITY DEFINER function still has full access.
DROP POLICY IF EXISTS "Admins can view invitations for their orgs" ON public.invitations;
