CREATE TABLE "admin_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"old_value" jsonb,
	"new_value" jsonb,
	"ip_address" text,
	"user_agent" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_contents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" jsonb NOT NULL,
	"metadata" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_contents_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"type" text DEFAULT 'info' NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"target_audience" text DEFAULT 'all' NOT NULL,
	"target_workspace_id" uuid,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "budget_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"entry_date" timestamp DEFAULT now() NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "budget_entries_amount_nonnegative" CHECK ("budget_entries"."amount" >= 0)
);
--> statement-breakpoint
ALTER TABLE "budget_entries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "calendar_syncs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"calendar_id" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"sync_direction" text DEFAULT 'BIDIRECTIONAL' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_sync_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "calendar_syncs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "check_in_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guest_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"action" text NOT NULL,
	"performed_by" text,
	"device_info" text,
	"invitation_code" text NOT NULL,
	"checked_in_at" timestamp with time zone DEFAULT now() NOT NULL,
	"synced_at" timestamp with time zone,
	"sync_status" text DEFAULT 'PENDING',
	"conflict_resolution" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "check_in_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "command_center_incidents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"severity" text DEFAULT 'LOW' NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"reported_by" text,
	"resolved_by" text,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "command_center_incidents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "command_center_team" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"phone_number" text,
	"status" text DEFAULT 'ON_TIME' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "command_center_team" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "expense_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expense_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expense_attachments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"scope" text DEFAULT 'global' NOT NULL,
	"target_id" uuid,
	"metadata" jsonb,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feature_flags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "invitation_customization" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"couple_photo_url" text,
	"theme" text DEFAULT 'emas',
	"music_url" text,
	"story" text,
	"gallery_image_ids" jsonb,
	"gift_accounts" jsonb,
	"video_url" text,
	"live_stream_url" text,
	"story_timeline" jsonb,
	"custom_font" text DEFAULT 'Playfair Display',
	"background_image_url" text,
	"hero_photo_urls" jsonb,
	"enable_animations" boolean DEFAULT false NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitation_customization_workspace_id_unique" UNIQUE("workspace_id")
);
--> statement-breakpoint
ALTER TABLE "invitation_customization" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "push_notification_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"user_agent" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recurring_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"notes" text,
	"priority" "task_priority" DEFAULT 'MEDIUM' NOT NULL,
	"category_id" uuid,
	"recurrence_pattern" text NOT NULL,
	"recurrence_interval" integer DEFAULT 1 NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_generated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recurring_tasks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "seat_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"table_id" uuid NOT NULL,
	"guest_id" uuid NOT NULL,
	"seat_number" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "seat_assignments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "seating_tables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"table_name" text NOT NULL,
	"capacity" integer DEFAULT 10 NOT NULL,
	"position_x" integer DEFAULT 0 NOT NULL,
	"position_y" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "seating_tables" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "support_ticket_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"message" text NOT NULL,
	"is_internal" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"workspace_id" uuid,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"priority" text DEFAULT 'MEDIUM' NOT NULL,
	"category" text NOT NULL,
	"assigned_to_id" uuid,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"category" text DEFAULT 'general' NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "whatsapp_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"guest_id" uuid NOT NULL,
	"phone_number" text NOT NULL,
	"message_type" text NOT NULL,
	"message_template" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "whatsapp_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"phone_number" text NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"task_reminders" boolean DEFAULT true NOT NULL,
	"budget_alerts" boolean DEFAULT true NOT NULL,
	"event_reminders" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "side" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "checked_in_by" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "checked_in_device" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "is_vip" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "is_trial" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "trial_ends_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" text DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_contents" ADD CONSTRAINT "admin_contents_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_target_workspace_id_wedding_workspaces_id_fk" FOREIGN KEY ("target_workspace_id") REFERENCES "public"."wedding_workspaces"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_entries" ADD CONSTRAINT "budget_entries_workspace_id_wedding_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."wedding_workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_syncs" ADD CONSTRAINT "calendar_syncs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_syncs" ADD CONSTRAINT "calendar_syncs_workspace_id_wedding_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."wedding_workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_in_logs" ADD CONSTRAINT "check_in_logs_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_in_logs" ADD CONSTRAINT "check_in_logs_workspace_id_wedding_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."wedding_workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_center_incidents" ADD CONSTRAINT "command_center_incidents_workspace_id_wedding_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."wedding_workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_center_team" ADD CONSTRAINT "command_center_team_workspace_id_wedding_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."wedding_workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_attachments" ADD CONSTRAINT "expense_attachments_expense_id_expenses_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_attachments" ADD CONSTRAINT "expense_attachments_workspace_id_wedding_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."wedding_workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_attachments" ADD CONSTRAINT "expense_attachments_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation_customization" ADD CONSTRAINT "invitation_customization_workspace_id_wedding_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."wedding_workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_notification_subscriptions" ADD CONSTRAINT "push_notification_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_tasks" ADD CONSTRAINT "recurring_tasks_workspace_id_wedding_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."wedding_workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_tasks" ADD CONSTRAINT "recurring_tasks_category_id_task_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."task_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_tasks" ADD CONSTRAINT "recurring_tasks_workspace_category_fk" FOREIGN KEY ("workspace_id","category_id") REFERENCES "public"."task_categories"("workspace_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seat_assignments" ADD CONSTRAINT "seat_assignments_workspace_id_wedding_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."wedding_workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seat_assignments" ADD CONSTRAINT "seat_assignments_table_id_seating_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."seating_tables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seat_assignments" ADD CONSTRAINT "seat_assignments_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seating_tables" ADD CONSTRAINT "seating_tables_workspace_id_wedding_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."wedding_workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_messages" ADD CONSTRAINT "support_ticket_messages_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_messages" ADD CONSTRAINT "support_ticket_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_workspace_id_wedding_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."wedding_workspaces"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_workspace_id_wedding_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."wedding_workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_notifications" ADD CONSTRAINT "whatsapp_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_audit_logs_admin_idx" ON "admin_audit_logs" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "admin_audit_logs_action_idx" ON "admin_audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "admin_audit_logs_entity_idx" ON "admin_audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "admin_audit_logs_created_at_idx" ON "admin_audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "admin_contents_type_idx" ON "admin_contents" USING btree ("type");--> statement-breakpoint
CREATE INDEX "admin_contents_active_idx" ON "admin_contents" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "announcements_active_idx" ON "announcements" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "announcements_date_idx" ON "announcements" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "announcements_created_at_idx" ON "announcements" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "budget_entries_workspace_idx" ON "budget_entries" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "budget_entries_date_idx" ON "budget_entries" USING btree ("workspace_id","entry_date");--> statement-breakpoint
CREATE INDEX "calendar_syncs_user_idx" ON "calendar_syncs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "calendar_syncs_workspace_idx" ON "calendar_syncs" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "check_in_logs_guest_idx" ON "check_in_logs" USING btree ("guest_id");--> statement-breakpoint
CREATE INDEX "check_in_logs_workspace_idx" ON "check_in_logs" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "check_in_logs_sync_idx" ON "check_in_logs" USING btree ("sync_status");--> statement-breakpoint
CREATE INDEX "check_in_logs_action_idx" ON "check_in_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_command_center_incidents_workspace" ON "command_center_incidents" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_command_center_team_workspace" ON "command_center_team" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "expense_attachments_expense_idx" ON "expense_attachments" USING btree ("expense_id");--> statement-breakpoint
CREATE INDEX "feature_flags_name_idx" ON "feature_flags" USING btree ("name");--> statement-breakpoint
CREATE INDEX "feature_flags_scope_idx" ON "feature_flags" USING btree ("scope");--> statement-breakpoint
CREATE INDEX "push_notification_subscriptions_user_idx" ON "push_notification_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "recurring_tasks_workspace_idx" ON "recurring_tasks" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_seat_assignments_workspace" ON "seat_assignments" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_seat_assignments_table" ON "seat_assignments" USING btree ("table_id");--> statement-breakpoint
CREATE INDEX "idx_seating_tables_workspace" ON "seating_tables" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "support_ticket_messages_ticket_idx" ON "support_ticket_messages" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "support_tickets_user_idx" ON "support_tickets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "support_tickets_status_idx" ON "support_tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "support_tickets_created_idx" ON "support_tickets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "system_settings_key_idx" ON "system_settings" USING btree ("key");--> statement-breakpoint
CREATE INDEX "system_settings_category_idx" ON "system_settings" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_whatsapp_messages_workspace" ON "whatsapp_messages" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_whatsapp_messages_guest" ON "whatsapp_messages" USING btree ("guest_id");--> statement-breakpoint
CREATE INDEX "idx_whatsapp_messages_status" ON "whatsapp_messages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "whatsapp_notifications_user_idx" ON "whatsapp_notifications" USING btree ("user_id");--> statement-breakpoint
CREATE POLICY "workspace_member_read" ON "budget_entries" AS PERMISSIVE FOR SELECT TO "sewaka_app" USING (
    
    "budget_entries"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "budget_entries"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      null
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_collaborator_write" ON "budget_entries" AS PERMISSIVE FOR ALL TO "sewaka_app" USING (
    
    "budget_entries"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "budget_entries"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  ) WITH CHECK (
    
    "budget_entries"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "budget_entries"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_member_read" ON "calendar_syncs" AS PERMISSIVE FOR SELECT TO "sewaka_app" USING (
    
    "calendar_syncs"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "calendar_syncs"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      null
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_collaborator_write" ON "calendar_syncs" AS PERMISSIVE FOR ALL TO "sewaka_app" USING (
    
    "calendar_syncs"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "calendar_syncs"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  ) WITH CHECK (
    
    "calendar_syncs"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "calendar_syncs"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_member_read" ON "check_in_logs" AS PERMISSIVE FOR SELECT TO "sewaka_app" USING (
    
    "check_in_logs"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "check_in_logs"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      null
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_collaborator_write" ON "check_in_logs" AS PERMISSIVE FOR ALL TO "sewaka_app" USING (
    
    "check_in_logs"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "check_in_logs"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  ) WITH CHECK (
    
    "check_in_logs"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "check_in_logs"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_member_read" ON "command_center_incidents" AS PERMISSIVE FOR SELECT TO "sewaka_app" USING (
    
    "command_center_incidents"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "command_center_incidents"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      null
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_collaborator_write" ON "command_center_incidents" AS PERMISSIVE FOR ALL TO "sewaka_app" USING (
    
    "command_center_incidents"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "command_center_incidents"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  ) WITH CHECK (
    
    "command_center_incidents"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "command_center_incidents"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_member_read" ON "command_center_team" AS PERMISSIVE FOR SELECT TO "sewaka_app" USING (
    
    "command_center_team"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "command_center_team"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      null
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_collaborator_write" ON "command_center_team" AS PERMISSIVE FOR ALL TO "sewaka_app" USING (
    
    "command_center_team"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "command_center_team"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  ) WITH CHECK (
    
    "command_center_team"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "command_center_team"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_member_read" ON "expense_attachments" AS PERMISSIVE FOR SELECT TO "sewaka_app" USING (
    
    "expense_attachments"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "expense_attachments"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      null
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_collaborator_write" ON "expense_attachments" AS PERMISSIVE FOR ALL TO "sewaka_app" USING (
    
    "expense_attachments"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "expense_attachments"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  ) WITH CHECK (
    
    "expense_attachments"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "expense_attachments"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_member_read" ON "invitation_customization" AS PERMISSIVE FOR SELECT TO "sewaka_app" USING (
    
    "invitation_customization"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "invitation_customization"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      null
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_collaborator_write" ON "invitation_customization" AS PERMISSIVE FOR ALL TO "sewaka_app" USING (
    
    "invitation_customization"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "invitation_customization"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  ) WITH CHECK (
    
    "invitation_customization"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "invitation_customization"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_member_read" ON "recurring_tasks" AS PERMISSIVE FOR SELECT TO "sewaka_app" USING (
    
    "recurring_tasks"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "recurring_tasks"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      null
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_collaborator_write" ON "recurring_tasks" AS PERMISSIVE FOR ALL TO "sewaka_app" USING (
    
    "recurring_tasks"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "recurring_tasks"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  ) WITH CHECK (
    
    "recurring_tasks"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "recurring_tasks"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_member_read" ON "seat_assignments" AS PERMISSIVE FOR SELECT TO "sewaka_app" USING (
    
    "seat_assignments"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "seat_assignments"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      null
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_collaborator_write" ON "seat_assignments" AS PERMISSIVE FOR ALL TO "sewaka_app" USING (
    
    "seat_assignments"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "seat_assignments"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  ) WITH CHECK (
    
    "seat_assignments"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "seat_assignments"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_member_read" ON "seating_tables" AS PERMISSIVE FOR SELECT TO "sewaka_app" USING (
    
    "seating_tables"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "seating_tables"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      null
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_collaborator_write" ON "seating_tables" AS PERMISSIVE FOR ALL TO "sewaka_app" USING (
    
    "seating_tables"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "seating_tables"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  ) WITH CHECK (
    
    "seating_tables"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "seating_tables"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_member_read" ON "whatsapp_messages" AS PERMISSIVE FOR SELECT TO "sewaka_app" USING (
    
    "whatsapp_messages"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "whatsapp_messages"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      null
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_collaborator_write" ON "whatsapp_messages" AS PERMISSIVE FOR ALL TO "sewaka_app" USING (
    
    "whatsapp_messages"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "whatsapp_messages"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  ) WITH CHECK (
    
    "whatsapp_messages"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "whatsapp_messages"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  );