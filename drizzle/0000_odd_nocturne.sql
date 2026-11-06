CREATE TYPE "public"."rsvp_status" AS ENUM('PENDING', 'ACCEPTED', 'DECLINED');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('TODO', 'IN_PROGRESS', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."vendor_status" AS ENUM('SHORTLISTED', 'CONTACTED', 'BOOKED');--> statement-breakpoint
CREATE TYPE "public"."workspace_role" AS ENUM('OWNER', 'PARTNER', 'FAMILY', 'COORDINATOR');--> statement-breakpoint
CREATE TABLE "accounts" (
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"actor_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "budget_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"allocated_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "budget_categories_allocation_nonnegative" CHECK ("budget_categories"."allocated_amount" >= 0)
);
--> statement-breakpoint
ALTER TABLE "budget_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"total_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "budgets_workspace_id_unique" UNIQUE("workspace_id"),
	CONSTRAINT "budgets_total_nonnegative" CHECK ("budgets"."total_amount" >= 0)
);
--> statement-breakpoint
ALTER TABLE "budgets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"category_id" uuid,
	"amount" numeric(14, 2) NOT NULL,
	"note" text,
	"expense_date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "expenses_amount_nonnegative" CHECK ("expenses"."amount" >= 0)
);
--> statement-breakpoint
ALTER TABLE "expenses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "guests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"category" text,
	"rsvp_status" "rsvp_status" DEFAULT 'PENDING' NOT NULL,
	"plus_ones" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guests_plus_ones_nonnegative" CHECK ("guests"."plus_ones" >= 0)
);
--> statement-breakpoint
ALTER TABLE "guests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "task_status" DEFAULT 'TODO' NOT NULL,
	"priority" "task_priority" DEFAULT 'MEDIUM' NOT NULL,
	"due_date" timestamp with time zone,
	"assigned_to_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_credentials" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"password_hash" text NOT NULL,
	"password_updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text,
	"email_verified" timestamp with time zone,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"contact_name" text,
	"phone" text,
	"email" text,
	"notes" text,
	"status" "vendor_status" DEFAULT 'SHORTLISTED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vendors_workspace_id_uidx" UNIQUE("workspace_id", "id")
);
--> statement-breakpoint
ALTER TABLE "vendors" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token"),
	CONSTRAINT "verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "wedding_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"event_date" timestamp with time zone,
	"location" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wedding_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "wedding_workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"couple_one" text,
	"couple_two" text,
	"wedding_date" timestamp with time zone,
	"location" text,
	"total_budget" numeric(14, 2) DEFAULT '0' NOT NULL,
	"timezone" text DEFAULT 'Asia/Jakarta' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wedding_workspaces_budget_nonnegative" CHECK ("wedding_workspaces"."total_budget" >= 0)
);
--> statement-breakpoint
ALTER TABLE "wedding_workspaces" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workspace_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "workspace_role" DEFAULT 'PARTNER' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workspace_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_workspace_id_wedding_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."wedding_workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_categories" ADD CONSTRAINT "budget_categories_workspace_id_wedding_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."wedding_workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_workspace_id_wedding_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."wedding_workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_workspace_id_wedding_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."wedding_workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guests" ADD CONSTRAINT "guests_workspace_id_wedding_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."wedding_workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_workspace_id_wedding_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."wedding_workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_credentials" ADD CONSTRAINT "user_credentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_workspace_id_wedding_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."wedding_workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wedding_events" ADD CONSTRAINT "wedding_events_workspace_id_wedding_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."wedding_workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_wedding_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."wedding_workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activity_logs_workspace_created_idx" ON "activity_logs" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "budget_categories_workspace_name_uidx" ON "budget_categories" USING btree ("workspace_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "budget_categories_workspace_id_uidx" ON "budget_categories" USING btree ("workspace_id","id");--> statement-breakpoint
CREATE INDEX "expenses_workspace_date_idx" ON "expenses" USING btree ("workspace_id","expense_date");--> statement-breakpoint
CREATE INDEX "expenses_workspace_category_idx" ON "expenses" USING btree ("workspace_id","category_id");--> statement-breakpoint
CREATE INDEX "guests_workspace_rsvp_idx" ON "guests" USING btree ("workspace_id","rsvp_status");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tasks_workspace_status_due_idx" ON "tasks" USING btree ("workspace_id","status","due_date");--> statement-breakpoint
CREATE INDEX "tasks_assigned_to_id_idx" ON "tasks" USING btree ("assigned_to_id");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "vendors_workspace_category_idx" ON "vendors" USING btree ("workspace_id","category");--> statement-breakpoint
CREATE INDEX "verification_tokens_expires_idx" ON "verification_tokens" USING btree ("expires");--> statement-breakpoint
CREATE INDEX "wedding_events_workspace_date_idx" ON "wedding_events" USING btree ("workspace_id","event_date");--> statement-breakpoint
CREATE INDEX "wedding_workspaces_created_at_idx" ON "wedding_workspaces" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_members_workspace_user_uidx" ON "workspace_members" USING btree ("workspace_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_members_one_owner_per_user_uidx" ON "workspace_members" USING btree ("user_id") WHERE "workspace_members"."role" = 'OWNER';--> statement-breakpoint
CREATE INDEX "workspace_members_user_id_idx" ON "workspace_members" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_workspace_category_fk" FOREIGN KEY ("workspace_id","category_id") REFERENCES "public"."budget_categories"("workspace_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_workspace_member_fk" FOREIGN KEY ("workspace_id","assigned_to_id") REFERENCES "public"."workspace_members"("workspace_id","user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sewaka_rls') THEN
    RAISE EXCEPTION 'Required role sewaka_rls is missing; provision database roles before migrating';
  END IF;
END
$$;--> statement-breakpoint
GRANT SELECT ON public.workspace_members TO sewaka_rls;--> statement-breakpoint
SET ROLE sewaka_rls;--> statement-breakpoint
CREATE FUNCTION public.has_workspace_role(
  requested_workspace_id uuid,
  requested_user_id uuid,
  allowed_roles text[]
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members AS membership
    WHERE membership.workspace_id = requested_workspace_id
      AND membership.user_id = requested_user_id
      AND (
        allowed_roles IS NULL
        OR membership.role::text = ANY(allowed_roles)
      )
  )
$$;--> statement-breakpoint
REVOKE ALL ON FUNCTION public.has_workspace_role(uuid, uuid, text[]) FROM PUBLIC;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.has_workspace_role(uuid, uuid, text[]) TO sewaka_app;--> statement-breakpoint
RESET ROLE;--> statement-breakpoint
CREATE POLICY "workspace_member_read" ON "activity_logs" AS PERMISSIVE FOR SELECT TO "sewaka_app" USING (
    
    "activity_logs"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "activity_logs"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      null
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_collaborator_write" ON "activity_logs" AS PERMISSIVE FOR ALL TO "sewaka_app" USING (
    
    "activity_logs"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "activity_logs"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  ) WITH CHECK (
    
    "activity_logs"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "activity_logs"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_member_read" ON "budget_categories" AS PERMISSIVE FOR SELECT TO "sewaka_app" USING (
    
    "budget_categories"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "budget_categories"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      null
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_collaborator_write" ON "budget_categories" AS PERMISSIVE FOR ALL TO "sewaka_app" USING (
    
    "budget_categories"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "budget_categories"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  ) WITH CHECK (
    
    "budget_categories"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "budget_categories"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_member_read" ON "budgets" AS PERMISSIVE FOR SELECT TO "sewaka_app" USING (
    
    "budgets"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "budgets"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      null
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_collaborator_write" ON "budgets" AS PERMISSIVE FOR ALL TO "sewaka_app" USING (
    
    "budgets"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "budgets"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  ) WITH CHECK (
    
    "budgets"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "budgets"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_member_read" ON "expenses" AS PERMISSIVE FOR SELECT TO "sewaka_app" USING (
    
    "expenses"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "expenses"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      null
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_collaborator_write" ON "expenses" AS PERMISSIVE FOR ALL TO "sewaka_app" USING (
    
    "expenses"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "expenses"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  ) WITH CHECK (
    
    "expenses"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "expenses"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_member_read" ON "guests" AS PERMISSIVE FOR SELECT TO "sewaka_app" USING (
    
    "guests"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "guests"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      null
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_collaborator_write" ON "guests" AS PERMISSIVE FOR ALL TO "sewaka_app" USING (
    
    "guests"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "guests"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  ) WITH CHECK (
    
    "guests"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "guests"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_member_read" ON "tasks" AS PERMISSIVE FOR SELECT TO "sewaka_app" USING (
    
    "tasks"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "tasks"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      null
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_collaborator_write" ON "tasks" AS PERMISSIVE FOR ALL TO "sewaka_app" USING (
    
    "tasks"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "tasks"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  ) WITH CHECK (
    
    "tasks"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "tasks"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_member_read" ON "vendors" AS PERMISSIVE FOR SELECT TO "sewaka_app" USING (
    
    "vendors"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "vendors"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      null
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_collaborator_write" ON "vendors" AS PERMISSIVE FOR ALL TO "sewaka_app" USING (
    
    "vendors"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "vendors"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  ) WITH CHECK (
    
    "vendors"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "vendors"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_member_read" ON "wedding_events" AS PERMISSIVE FOR SELECT TO "sewaka_app" USING (
    
    "wedding_events"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "wedding_events"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      null
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_collaborator_write" ON "wedding_events" AS PERMISSIVE FOR ALL TO "sewaka_app" USING (
    
    "wedding_events"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "wedding_events"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  ) WITH CHECK (
    
    "wedding_events"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
  
    and public.has_workspace_role(
      "wedding_events"."workspace_id",
      nullif(current_setting('app.user_id', true), '')::uuid,
      ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
  );--> statement-breakpoint
CREATE POLICY "workspace_owner_read" ON "wedding_workspaces" AS PERMISSIVE FOR SELECT TO "sewaka_app" USING (
        id = nullif(current_setting('app.workspace_id', true), '')::uuid
        and public.has_workspace_role(
          "wedding_workspaces"."id",
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      );--> statement-breakpoint
CREATE POLICY "workspace_owner_write" ON "wedding_workspaces" AS PERMISSIVE FOR ALL TO "sewaka_app" USING (
        id = nullif(current_setting('app.workspace_id', true), '')::uuid
        and public.has_workspace_role(
          "wedding_workspaces"."id",
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      ) WITH CHECK (
        id = nullif(current_setting('app.workspace_id', true), '')::uuid
        and public.has_workspace_role(
          "wedding_workspaces"."id",
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      );--> statement-breakpoint
CREATE POLICY "workspace_create_for_user" ON "wedding_workspaces" AS PERMISSIVE FOR INSERT TO "sewaka_app" WITH CHECK (
        id = nullif(current_setting('app.workspace_id', true), '')::uuid
        and exists (
          select 1 from public.users as account
          where account.id = nullif(current_setting('app.user_id', true), '')::uuid
        )
      );--> statement-breakpoint
CREATE POLICY "workspace_member_read_self" ON "workspace_members" AS PERMISSIVE FOR SELECT TO "sewaka_app" USING (
        "workspace_members"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
        and "workspace_members"."user_id" = nullif(current_setting('app.user_id', true), '')::uuid
      );--> statement-breakpoint
CREATE POLICY "workspace_owner_read_members" ON "workspace_members" AS PERMISSIVE FOR SELECT TO "sewaka_app" USING (
        "workspace_members"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
        and public.has_workspace_role(
          "workspace_members"."workspace_id",
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      );--> statement-breakpoint
CREATE POLICY "workspace_owner_add_self" ON "workspace_members" AS PERMISSIVE FOR INSERT TO "sewaka_app" WITH CHECK (
        "workspace_members"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
        and "workspace_members"."role" = 'OWNER'
        and "workspace_members"."user_id" = nullif(current_setting('app.user_id', true), '')::uuid
      );--> statement-breakpoint
CREATE POLICY "workspace_owner_add_collaborator" ON "workspace_members" AS PERMISSIVE FOR INSERT TO "sewaka_app" WITH CHECK (
        "workspace_members"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
        and "workspace_members"."role" in ('PARTNER', 'FAMILY', 'COORDINATOR')
        and public.has_workspace_role(
          "workspace_members"."workspace_id",
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      );--> statement-breakpoint
CREATE POLICY "workspace_owner_update_collaborator" ON "workspace_members" AS PERMISSIVE FOR UPDATE TO "sewaka_app" USING (
        "workspace_members"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
        and "workspace_members"."role" <> 'OWNER'
        and public.has_workspace_role(
          "workspace_members"."workspace_id",
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      ) WITH CHECK (
        "workspace_members"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
        and "workspace_members"."role" in ('PARTNER', 'FAMILY', 'COORDINATOR')
        and public.has_workspace_role(
          "workspace_members"."workspace_id",
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      );--> statement-breakpoint
CREATE POLICY "workspace_owner_delete_collaborator" ON "workspace_members" AS PERMISSIVE FOR DELETE TO "sewaka_app" USING (
        "workspace_members"."workspace_id" = nullif(current_setting('app.workspace_id', true), '')::uuid
        and "workspace_members"."role" <> 'OWNER'
        and public.has_workspace_role(
          "workspace_members"."workspace_id",
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      );--> statement-breakpoint
ALTER TABLE "activity_logs" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "budget_categories" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "budgets" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "expenses" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "guests" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tasks" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "vendors" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "wedding_events" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "wedding_workspaces" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "workspace_members" FORCE ROW LEVEL SECURITY;