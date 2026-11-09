ALTER TABLE public.calendar_syncs
  ADD COLUMN IF NOT EXISTS token_expires_at timestamptz;
