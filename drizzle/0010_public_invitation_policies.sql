-- 0010_public_invitation_policies.sql
-- Izinkan pembacaan publik untuk halaman undangan digital dan pengiriman RSVP tamu

CREATE POLICY workspace_public_invitation_read
ON public.wedding_workspaces
FOR SELECT
TO sewaka_app
USING (invitation_slug IS NOT NULL);

CREATE POLICY events_public_invitation_read
ON public.wedding_events
FOR SELECT
TO sewaka_app
USING (
  workspace_id IN (
    SELECT id FROM public.wedding_workspaces WHERE invitation_slug IS NOT NULL
  )
);

CREATE POLICY guests_public_rsvp_insert
ON public.guests
FOR INSERT
TO sewaka_app
WITH CHECK (
  workspace_id IN (
    SELECT id FROM public.wedding_workspaces WHERE invitation_slug IS NOT NULL
  )
);

CREATE POLICY guests_public_wishes_read
ON public.guests
FOR SELECT
TO sewaka_app
USING (
  wishes IS NOT NULL
  AND workspace_id IN (
    SELECT id FROM public.wedding_workspaces WHERE invitation_slug IS NOT NULL
  )
);
