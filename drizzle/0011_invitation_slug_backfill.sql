-- 0011_invitation_slug_backfill.sql
-- Backfill invitation_slug for existing workspaces and add to list_my_workspaces function

UPDATE public.wedding_workspaces
SET invitation_slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(id::text, 1, 6)
WHERE invitation_slug IS NULL;

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
  invitation_slug text,
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
    workspace.invitation_slug,
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
