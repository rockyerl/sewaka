-- Invitation Customization table for storing public invitation customization settings per workspace

CREATE TABLE IF NOT EXISTS "invitation_customization" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "workspace_id" uuid NOT NULL UNIQUE REFERENCES "wedding_workspaces"("id") ON DELETE CASCADE,
  "couple_photo_url" text,
  "theme" text DEFAULT 'emas',
  "music_url" text,
  "story" text,
  "gallery_image_ids" jsonb,
  "enabled" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE "invitation_customization" ENABLE ROW LEVEL SECURITY;

CREATE INDEX "invitation_customization_workspace_idx" ON "invitation_customization"("workspace_id");

-- Policy: workspace members can read
CREATE POLICY "workspace_member_read" ON "invitation_customization"
  FOR SELECT TO "sewaka_app"
  USING (
    "workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
    AND public.has_workspace_role(
      "workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      null
    )
  );

-- Policy: workspace collaborators can write
CREATE POLICY "workspace_collaborator_write" ON "invitation_customization"
  FOR ALL TO "sewaka_app"
  USING (
    "workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
    AND public.has_workspace_role(
      "workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  )
  WITH CHECK (
    "workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
    AND public.has_workspace_role(
      "workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  );
