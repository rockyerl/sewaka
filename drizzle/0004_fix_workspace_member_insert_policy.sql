-- 0004_fix_workspace_member_insert_policy.sql
-- Fix RLS policy for workspace_members INSERT: remove has_workspace_role check
-- that causes chicken-and-egg problem during workspace creation

-- Drop the old policy
DROP POLICY IF EXISTS "workspace_owner_add_self" ON public.workspace_members;

-- Create the new policy that only checks workspace exists, not membership
CREATE POLICY "workspace_owner_add_self" ON public.workspace_members
  FOR INSERT
  TO sewaka_app
  WITH CHECK (
    workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
    AND role = 'OWNER'
    AND user_id = nullif(current_setting('app.user_id', true), '')::uuid
    AND EXISTS (
      SELECT 1 FROM public.wedding_workspaces AS ws
      WHERE ws.id = workspace_id
    )
  );
