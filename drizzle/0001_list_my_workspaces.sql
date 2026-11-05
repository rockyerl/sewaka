DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sewaka_rls') THEN
    RAISE EXCEPTION 'Required role sewaka_rls is missing; provision database roles before migrating';
  END IF;
END
$$;--> statement-breakpoint
GRANT SELECT ON public.wedding_workspaces TO sewaka_rls;--> statement-breakpoint
SET ROLE sewaka_rls;--> statement-breakpoint
CREATE FUNCTION public.list_my_workspaces()
RETURNS TABLE (
  id uuid,
  name text,
  couple_one text,
  couple_two text,
  wedding_date timestamp with time zone,
  location text,
  total_budget numeric(14, 2),
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
    membership.role
  FROM public.workspace_members AS membership
  JOIN public.wedding_workspaces AS workspace
    ON workspace.id = membership.workspace_id
  WHERE membership.user_id =
    nullif(current_setting('app.user_id', true), '')::uuid
  ORDER BY workspace.created_at ASC
$$;--> statement-breakpoint
REVOKE ALL ON FUNCTION public.list_my_workspaces() FROM PUBLIC;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.list_my_workspaces() TO sewaka_app;--> statement-breakpoint
RESET ROLE;
