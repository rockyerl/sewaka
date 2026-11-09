-- Migration 0027: Security fixes
-- Add missing public RLS policies for check-in API endpoints

CREATE POLICY guests_public_check_in_update
ON public.guests
FOR UPDATE
TO sewaka_app
USING (
  workspace_id IN (
    SELECT id FROM public.wedding_workspaces WHERE invitation_slug IS NOT NULL
  )
)
WITH CHECK (
  workspace_id IN (
    SELECT id FROM public.wedding_workspaces WHERE invitation_slug IS NOT NULL
  )
);

CREATE POLICY check_in_logs_public_insert
ON public.check_in_logs
FOR INSERT
TO sewaka_app
WITH CHECK (
  workspace_id IN (
    SELECT id FROM public.wedding_workspaces WHERE invitation_slug IS NOT NULL
  )
);
