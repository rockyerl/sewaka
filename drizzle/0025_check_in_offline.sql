-- 0025_check_in_offline.sql
-- Tambah audit fields di guests table dan tabel check_in_logs untuk offline check-in support

-- Audit fields di guests table
ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "checked_in_by" text;
ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "checked_in_device" text;

-- Tabel audit log check-in
CREATE TABLE IF NOT EXISTS "check_in_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "guest_id" uuid NOT NULL REFERENCES "guests"("id"),
  "workspace_id" uuid NOT NULL,
  "action" text NOT NULL, -- 'CHECK_IN', 'CHECK_IN_OFFLINE', 'SYNC_SUCCESS', 'SYNC_FAILED', 'CONFLICT'
  "performed_by" text,
  "device_info" text,
  "invitation_code" text NOT NULL,
  "checked_in_at" timestamp with time zone NOT NULL DEFAULT now(),
  "synced_at" timestamp with time zone,
  "sync_status" text DEFAULT 'PENDING', -- 'PENDING', 'SYNCED', 'FAILED', 'CONFLICT'
  "conflict_resolution" text,
  "metadata" jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS "idx_check_in_logs_guest" ON "check_in_logs"("guest_id");
CREATE INDEX IF NOT EXISTS "idx_check_in_logs_workspace" ON "check_in_logs"("workspace_id");
CREATE INDEX IF NOT EXISTS "idx_check_in_logs_sync" ON "check_in_logs"("sync_status");
CREATE INDEX IF NOT EXISTS "idx_check_in_logs_action" ON "check_in_logs"("action");
