-- Merge nikah_berkas into documents table
-- Add checklist fields to documents

ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "document_description" text;
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "is_required" boolean NOT NULL DEFAULT false;
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "is_completed" boolean NOT NULL DEFAULT false;
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "deadline_date" date;
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "completed_at" timestamptz;
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "notes" text;
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "nikah_type" text;
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "updated_at" timestamptz NOT NULL DEFAULT now();

-- Make filePath, fileSize, mimeType nullable for checklist items without files
ALTER TABLE "documents" ALTER COLUMN "file_path" DROP NOT NULL;
ALTER TABLE "documents" ALTER COLUMN "file_size" DROP NOT NULL;
ALTER TABLE "documents" ALTER COLUMN "mime_type" DROP NOT NULL;

-- Update the check constraint to allow NULL file_size
ALTER TABLE "documents" DROP CONSTRAINT IF EXISTS "documents_file_size_positive";
ALTER TABLE "documents" ADD CONSTRAINT "documents_file_size_positive" CHECK ("file_size" IS NULL OR "file_size" > 0);

-- Add index for nikah_type queries
CREATE INDEX IF NOT EXISTS "documents_nikah_type_idx" ON "documents" ("workspace_id", "nikah_type");

-- Migrate and remove the legacy table only when it is present.
DO $$
BEGIN
  IF to_regclass('public.nikah_berkas') IS NOT NULL THEN
    INSERT INTO "documents" (
      "id", "workspace_id", "name", "category", "file_path",
      "document_description", "is_required", "is_completed", "deadline_date",
      "completed_at", "notes", "nikah_type", "created_at", "updated_at"
    )
    SELECT
      "id", "workspace_id", "document_name",
      CASE "nikah_type"
        WHEN 'SIPIL' THEN 'Nikah Sipil'
        WHEN 'AGAMA' THEN 'Nikah Agama'
        WHEN 'KUA' THEN 'Nikah KUA'
        ELSE 'Lainnya'
      END,
      "file_url", "document_description", "is_required", "is_completed",
      "deadline_date", "completed_at", "notes", "nikah_type", "created_at", "updated_at"
    FROM "nikah_berkas"
    ON CONFLICT ("id") DO NOTHING;

    DROP POLICY IF EXISTS "nikah_berkas_workspace_select" ON "nikah_berkas";
    DROP POLICY IF EXISTS "nikah_berkas_workspace_insert" ON "nikah_berkas";
    DROP POLICY IF EXISTS "nikah_berkas_workspace_update" ON "nikah_berkas";
    DROP POLICY IF EXISTS "nikah_berkas_workspace_delete" ON "nikah_berkas";
    DROP TABLE "nikah_berkas";
  END IF;
END $$;
