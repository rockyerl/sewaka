-- Migration 0026: Competitive Gap Features
-- WhatsApp RSVP Automation, Seating Planner, Wedding Day Command Center

-- WhatsApp message tracking
CREATE TABLE "whatsapp_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "wedding_workspaces"("id") ON DELETE CASCADE,
  "guest_id" uuid NOT NULL REFERENCES "guests"("id") ON DELETE CASCADE,
  "phone_number" text NOT NULL,
  "message_type" text NOT NULL,
  "message_template" text NOT NULL,
  "status" text NOT NULL DEFAULT 'PENDING',
  "sent_at" timestamptz,
  "delivered_at" timestamptz,
  "read_at" timestamptz,
  "error_message" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "idx_whatsapp_messages_workspace" ON "whatsapp_messages"("workspace_id");
CREATE INDEX "idx_whatsapp_messages_guest" ON "whatsapp_messages"("guest_id");
CREATE INDEX "idx_whatsapp_messages_status" ON "whatsapp_messages"("status");

-- Seating planner
CREATE TABLE "seating_tables" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "wedding_workspaces"("id") ON DELETE CASCADE,
  "table_name" text NOT NULL,
  "capacity" integer NOT NULL DEFAULT 10,
  "position_x" integer NOT NULL DEFAULT 0,
  "position_y" integer NOT NULL DEFAULT 0,
  "notes" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "seat_assignments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "wedding_workspaces"("id") ON DELETE CASCADE,
  "table_id" uuid NOT NULL REFERENCES "seating_tables"("id") ON DELETE CASCADE,
  "guest_id" uuid NOT NULL REFERENCES "guests"("id") ON DELETE CASCADE,
  "seat_number" integer,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "idx_seating_tables_workspace" ON "seating_tables"("workspace_id");
CREATE INDEX "idx_seat_assignments_workspace" ON "seat_assignments"("workspace_id");
CREATE INDEX "idx_seat_assignments_table" ON "seat_assignments"("table_id");

-- Wedding day command center
CREATE TABLE "command_center_team" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "wedding_workspaces"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "role" text NOT NULL,
  "phone_number" text,
  "status" text NOT NULL DEFAULT 'ON_TIME',
  "notes" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "command_center_incidents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "wedding_workspaces"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "description" text,
  "severity" text NOT NULL DEFAULT 'LOW',
  "status" text NOT NULL DEFAULT 'OPEN',
  "reported_by" text,
  "resolved_by" text,
  "resolved_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "idx_command_center_team_workspace" ON "command_center_team"("workspace_id");
CREATE INDEX "idx_command_center_incidents_workspace" ON "command_center_incidents"("workspace_id");
