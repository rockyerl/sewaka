-- Guest photos table untuk fitur upload foto tamu di undangan public
-- Tamu bisa upload foto, admin bisa approve/reject sebelum ditampilkan

CREATE TABLE "guest_photos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "wedding_workspaces"("id") ON DELETE CASCADE,
  "guest_name" text NOT NULL,
  "guest_phone" text,
  "photo_url" text NOT NULL,
  "caption" text,
  "status" text NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "guest_photos_workspace_idx" ON "guest_photos" ("workspace_id");
CREATE INDEX "guest_photos_status_idx" ON "guest_photos" ("status");

-- RLS policies
ALTER TABLE "guest_photos" ENABLE ROW LEVEL SECURITY;

-- Workspace members can select all photos (for moderation)
CREATE POLICY "guest_photos_workspace_select" ON "guest_photos"
  FOR SELECT USING (
    current_setting('request.jwt.claims', true)::json->>'uid' = current_setting('app.current_workspace_owner', true)
  );

-- Workspace members can insert photos
CREATE POLICY "guest_photos_workspace_insert" ON "guest_photos"
  FOR INSERT WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'uid' = current_setting('app.current_workspace_owner', true)
  );

-- Workspace members can update photos (for approve/reject)
CREATE POLICY "guest_photos_workspace_update" ON "guest_photos"
  FOR UPDATE USING (
    current_setting('request.jwt.claims', true)::json->>'uid' = current_setting('app.current_workspace_owner', true)
  );

-- Public can insert photos (guest upload)
CREATE POLICY "guest_photos_public_insert" ON "guest_photos"
  FOR INSERT TO PUBLIC
  WITH CHECK (true);

-- Public can only select APPROVED photos
CREATE POLICY "guest_photos_public_select" ON "guest_photos"
  FOR SELECT TO PUBLIC
  USING (status = 'APPROVED');
