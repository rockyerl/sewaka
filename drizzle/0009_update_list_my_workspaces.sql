-- 0009_update_list_my_workspaces.sql
-- Update function list_my_workspaces to return cultural_tradition

SET ROLE sewaka_rls;

DROP FUNCTION IF EXISTS public.list_my_workspaces();

CREATE FUNCTION public.list_my_workspaces()
RETURNS TABLE (
  id uuid,
  name text,
  couple_one text,
  couple_two text,
  wedding_date timestamp with time zone,
  location text,
  total_budget numeric(14, 2),
  cultural_tradition text,
  role public.workspace_role
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT
    workspace.id,
    workspace.name,
    workspace.couple_one,
    workspace.couple_two,
    workspace.wedding_date,
    workspace.location,
    workspace.total_budget,
    workspace.cultural_tradition,
    membership.role
  FROM public.workspace_members AS membership
  JOIN public.wedding_workspaces AS workspace
    ON workspace.id = membership.workspace_id
  WHERE membership.user_id =
    nullif(current_setting('app.user_id', true), '')::uuid
  ORDER BY workspace.created_at ASC
$$;

REVOKE ALL ON FUNCTION public.list_my_workspaces() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_my_workspaces() TO sewaka_app;

RESET ROLE;
