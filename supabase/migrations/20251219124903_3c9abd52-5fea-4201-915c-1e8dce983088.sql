-- Fix: Add restrictive policies to parameters table (only admins can modify)
-- The SELECT policy already exists, we just need to ensure no INSERT/UPDATE/DELETE is allowed by regular users

-- Note: Parameters are system configuration, typically only modified by system/admins
-- Since there's no global admin concept, we'll restrict all modifications (system-managed only)