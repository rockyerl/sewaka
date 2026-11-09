-- Tambah kolom source di tasks table untuk track asal task
-- Default 'MANUAL' untuk backward compatibility
ALTER TABLE "tasks" ADD COLUMN "source" text DEFAULT 'MANUAL';

-- Index untuk query tasks by source
CREATE INDEX "idx_tasks_workspace_source" ON "tasks"("workspace_id", "source");
