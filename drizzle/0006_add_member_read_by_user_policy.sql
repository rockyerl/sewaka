-- 0006_add_member_read_by_user_policy.sql
-- Tambah policy agar user bisa membaca semua membership mereka sendiri
-- tanpa memerlukan app.workspace_id (untuk kebutuhan createWorkspace error handling)

CREATE POLICY workspace_member_read_by_user
ON public.workspace_members
FOR SELECT
TO sewaka_app
USING (
  user_id = nullif(current_setting('app.user_id', true), '')::uuid
);
