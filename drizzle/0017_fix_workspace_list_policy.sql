-- 0017_fix_workspace_list_policy.sql
-- Fix RLS policy so list_my_workspaces() can read workspace_members without app.workspace_id
-- The function uses SECURITY DEFINER with sewaka_rls role, so we need policies for that role too

-- Drop the existing policy that requires workspace_id
DROP POLICY IF EXISTS workspace_member_read_by_user ON public.workspace_members;

-- Recreate without requiring app.workspace_id - for both sewaka_app and sewaka_rls
CREATE POLICY workspace_member_read_by_user
ON public.workspace_members
FOR SELECT
TO sewaka_app, sewaka_rls
USING (
  user_id = nullif(current_setting('app.user_id', true), '')::uuid
);

-- Also fix the wedding_workspaces read policy for list_my_workspaces
-- The function needs to read workspaces through the JOIN, not just by workspace_id
DROP POLICY IF EXISTS "workspace_owner_read" ON public.wedding_workspaces;

CREATE POLICY "workspace_owner_read" ON public.wedding_workspaces
AS PERMISSIVE FOR SELECT TO "sewaka_app", "sewaka_rls" USING (
  -- Allow reading if app.workspace_id is set AND matches
  (id = nullif(current_setting('app.workspace_id', true), '')::uuid
   AND public.has_workspace_role(
     "wedding_workspaces"."id",
     nullif(current_setting('app.user_id', true), '')::uuid,
     ARRAY['OWNER']::text[]
   ))
  -- OR allow reading if user is a member (for list_my_workspaces)
  OR EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.workspace_id = "wedding_workspaces"."id"
      AND wm.user_id = nullif(current_setting('app.user_id', true), '')::uuid
  )
);
