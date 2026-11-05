-- 0005_cleanup_orphaned_workspace.sql
-- Hapus workspace dan membership yang sudah ada untuk user tertentu
-- Jalankan query ini di database client (DataGrip/WebStorm) dengan mengganti UUID di bawah

-- Ganti UUID ini dengan user_id kamu
-- Cari user_id: SELECT id, email FROM users WHERE email = 'rocky.bekerja@gmail.com';

-- Langkah 1: Lihat workspace dan membership yang ada
SELECT wm.id, wm.workspace_id, wm.user_id, wm.role, wm.created_at,
       ww.name as workspace_name, ww.couple_one, ww.couple_two
FROM workspace_members wm
LEFT JOIN wedding_workspaces ww ON wm.workspace_id = ww.id
WHERE wm.user_id = 'f6f0866c-2466-43fd-a6b9-60bb5ad2b492';

-- Langkah 2: Hapus membership ( Uncomment baris di bawah untuk menjalankan )
-- DELETE FROM workspace_members
-- WHERE user_id = 'f6f0866c-2466-43fd-a6b9-60bb5ad2b492';

-- Langkah 3: Hapus workspace yatim jika ada ( Uncomment baris di bawah untuk menjalankan )
-- DELETE FROM wedding_workspaces
-- WHERE id IN (
--   SELECT workspace_id FROM workspace_members
--   WHERE user_id = 'f6f0866c-2466-43fd-a6b9-60bb5ad2b492'
-- );

-- Atau hapus SEMUA workspace dan membership untuk mulai dari awal ( HATI-HATI! )
-- DELETE FROM workspace_members;
-- DELETE FROM wedding_workspaces;