-- 0003_fix_workspace_create_policy.sql
-- Fix RLS policy for workspace creation: remove users table check that fails due to RLS

-- Drop the old policy
DROP POLICY IF EXISTS "workspace_create_for_user" ON public.wedding_workspaces;

-- Create the new policy that only checks userId is not null
CREATE POLICY "workspace_create_for_user" ON public.wedding_workspaces
  FOR INSERT
  TO sewaka_app
  WITH CHECK (
    id = nullif(current_setting('app.workspace_id', true), '')::uuid
    AND nullif(current_setting('app.user_id', true), '')::uuid IS NOT NULL
  );
