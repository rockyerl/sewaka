-- Nikah Berkas: checklist dokumen administratif pernikahan Indonesia
CREATE TABLE "nikah_berkas" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "wedding_workspaces"("id") ON DELETE CASCADE,
  "nikah_type" text NOT NULL, -- 'SIPIL', 'AGAMA', 'KUA'
  "document_name" text NOT NULL,
  "document_description" text,
  "is_required" boolean NOT NULL DEFAULT true,
  "is_completed" boolean NOT NULL DEFAULT false,
  "file_url" text,
  "notes" text,
  "deadline_date" date,
  "completed_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "nikah_berkas_workspace_idx" ON "nikah_berkas" ("workspace_id");
CREATE INDEX "nikah_berkas_nikah_type_idx" ON "nikah_berkas" ("nikah_type");

-- RLS policies untuk nikah_berkas
ALTER TABLE "nikah_berkas" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nikah_berkas_workspace_select" ON "nikah_berkas"
  FOR SELECT USING (
    current_setting('request.jwt.claims', true)::json->>'uid' = current_setting('app.current_workspace_owner', true)
  );

CREATE POLICY "nikah_berkas_workspace_insert" ON "nikah_berkas"
  FOR INSERT WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'uid' = current_setting('app.current_workspace_owner', true)
  );

CREATE POLICY "nikah_berkas_workspace_update" ON "nikah_berkas"
  FOR UPDATE USING (
    current_setting('request.jwt.claims', true)::json->>'uid' = current_setting('app.current_workspace_owner', true)
  );

CREATE POLICY "nikah_berkas_workspace_delete" ON "nikah_berkas"
  FOR DELETE USING (
    current_setting('request.jwt.claims', true)::json->>'uid' = current_setting('app.current_workspace_owner', true)
  );

-- Vendor inquiries: pesan ke vendor dari dashboard
CREATE TABLE "vendor_inquiries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "wedding_workspaces"("id") ON DELETE CASCADE,
  "vendor_id" uuid NOT NULL REFERENCES "curated_vendors"("id") ON DELETE CASCADE,
  "message" text NOT NULL,
  "contact_method" text NOT NULL DEFAULT 'EMAIL', -- 'EMAIL', 'PHONE', 'WHATSAPP'
  "status" text NOT NULL DEFAULT 'SENT', -- 'SENT', 'REPLIED', 'CLOSED'
  "sent_at" timestamptz NOT NULL DEFAULT now(),
  "replied_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "vendor_inquiries_workspace_idx" ON "vendor_inquiries" ("workspace_id");
CREATE INDEX "vendor_inquiries_vendor_idx" ON "vendor_inquiries" ("vendor_id");

-- RLS policies untuk vendor_inquiries
ALTER TABLE "vendor_inquiries" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vendor_inquiries_workspace_select" ON "vendor_inquiries"
  FOR SELECT USING (
    current_setting('request.jwt.claims', true)::json->>'uid' = current_setting('app.current_workspace_owner', true)
  );

CREATE POLICY "vendor_inquiries_workspace_insert" ON "vendor_inquiries"
  FOR INSERT WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'uid' = current_setting('app.current_workspace_owner', true)
  );

CREATE POLICY "vendor_inquiries_workspace_update" ON "vendor_inquiries"
  FOR UPDATE USING (
    current_setting('request.jwt.claims', true)::json->>'uid' = current_setting('app.current_workspace_owner', true)
  );

-- Vendor reviews: rating dan review setelah layanan
CREATE TABLE "vendor_reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "wedding_workspaces"("id") ON DELETE CASCADE,
  "vendor_id" uuid NOT NULL REFERENCES "curated_vendors"("id") ON DELETE CASCADE,
  "rating" integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  "review_text" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "vendor_reviews_vendor_idx" ON "vendor_reviews" ("vendor_id");

-- RLS policies untuk vendor_reviews
ALTER TABLE "vendor_reviews" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vendor_reviews_workspace_select" ON "vendor_reviews"
  FOR SELECT USING (
    current_setting('request.jwt.claims', true)::json->>'uid' = current_setting('app.current_workspace_owner', true)
  );

CREATE POLICY "vendor_reviews_workspace_insert" ON "vendor_reviews"
  FOR INSERT WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'uid' = current_setting('app.current_workspace_owner', true)
  );

CREATE POLICY "vendor_reviews_workspace_delete" ON "vendor_reviews"
  FOR DELETE USING (
    current_setting('request.jwt.claims', true)::json->>'uid' = current_setting('app.current_workspace_owner', true)
  );

-- Guest thank you messages
CREATE TABLE "guest_thank_you" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "wedding_workspaces"("id") ON DELETE CASCADE,
  "guest_id" uuid NOT NULL REFERENCES "guests"("id") ON DELETE CASCADE,
  "message_template" text NOT NULL,
  "message_personalized" text,
  "channel" text NOT NULL DEFAULT 'WHATSAPP', -- 'WHATSAPP', 'EMAIL'
  "status" text NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'SENT', 'FAILED'
  "sent_at" timestamptz,
  "scheduled_for" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "guest_thank_you_workspace_idx" ON "guest_thank_you" ("workspace_id");
CREATE INDEX "guest_thank_you_guest_idx" ON "guest_thank_you" ("guest_id");

-- RLS policies untuk guest_thank_you
ALTER TABLE "guest_thank_you" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guest_thank_you_workspace_select" ON "guest_thank_you"
  FOR SELECT USING (
    current_setting('request.jwt.claims', true)::json->>'uid' = current_setting('app.current_workspace_owner', true)
  );

CREATE POLICY "guest_thank_you_workspace_insert" ON "guest_thank_you"
  FOR INSERT WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'uid' = current_setting('app.current_workspace_owner', true)
  );

CREATE POLICY "guest_thank_you_workspace_update" ON "guest_thank_you"
  FOR UPDATE USING (
    current_setting('request.jwt.claims', true)::json->>'uid' = current_setting('app.current_workspace_owner', true)
  );
