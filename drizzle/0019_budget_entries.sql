-- 0019_budget_entries
-- Tabel untuk menyimpan riwayat entri anggaran (anggaran dasar + tambahan)

CREATE TABLE IF NOT EXISTS budget_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES wedding_workspaces(id) ON DELETE CASCADE,
  amount NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS budget_entries_workspace_idx ON budget_entries(workspace_id);
CREATE INDEX IF NOT EXISTS budget_entries_date_idx ON budget_entries(workspace_id, entry_date DESC);

-- Enable RLS
ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
BEGIN
  -- Hapus policy jika sudah ada
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'workspace_member_read' AND tablename = 'budget_entries') THEN
    DROP POLICY workspace_member_read ON budget_entries;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'workspace_collaborator_write' AND tablename = 'budget_entries') THEN
    DROP POLICY workspace_collaborator_write ON budget_entries;
  END IF;
END $$;

CREATE POLICY workspace_member_read ON budget_entries
  FOR SELECT TO sewaka_app
  USING (
    workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
    AND public.has_workspace_role(
      workspace_id,
      nullif(current_setting('app.user_id', true), '')::uuid,
      null
    )
  );

CREATE POLICY workspace_collaborator_write ON budget_entries
  FOR ALL TO sewaka_app
  USING (
    workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
    AND public.has_workspace_role(
      workspace_id,
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  )
  WITH CHECK (
    workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
    AND public.has_workspace_role(
      workspace_id,
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  );
