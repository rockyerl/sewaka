-- Public guest check-in is atomic and only returns fields needed by the confirmation page.
DROP POLICY IF EXISTS guests_public_check_in_update ON public.guests;
DROP POLICY IF EXISTS check_in_logs_public_insert ON public.check_in_logs;

CREATE OR REPLACE FUNCTION public.public_guest_check_in(code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  guest_row public.guests%ROWTYPE;
  checked_at timestamptz := now();
BEGIN
  SELECT g.* INTO guest_row
  FROM public.guests g
  JOIN public.wedding_workspaces w ON w.id = g.workspace_id
  WHERE g.invitation_code = code AND w.invitation_slug IS NOT NULL
  FOR UPDATE OF g;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Kode undangan tidak ditemukan. Pastikan kode benar.');
  END IF;

  IF guest_row.checked_in THEN
    RETURN jsonb_build_object(
      'alreadyCheckedIn', true, 'workspaceId', guest_row.workspace_id,
      'guest', jsonb_build_object('id', guest_row.id, 'name', guest_row.name, 'checkedInAt', guest_row.checked_in_at)
    );
  END IF;

  UPDATE public.guests SET checked_in = true, checked_in_at = checked_at WHERE id = guest_row.id;
  INSERT INTO public.check_in_logs (guest_id, workspace_id, action, performed_by, device_info, invitation_code, checked_in_at, sync_status, metadata)
  VALUES (guest_row.id, guest_row.workspace_id, 'CHECK_IN', 'guest', 'public-page', code, checked_at, 'SYNCED', jsonb_build_object('guestName', guest_row.name));

  RETURN jsonb_build_object(
    'success', true, 'workspaceId', guest_row.workspace_id,
    'guest', jsonb_build_object('id', guest_row.id, 'name', guest_row.name, 'checkedInAt', checked_at)
  );
END;
$$;
REVOKE ALL ON FUNCTION public.public_guest_check_in(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_guest_check_in(text) TO sewaka_app;
