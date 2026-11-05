-- Migration: Add new features tables, enums, and columns
-- Task categories, checklist templates, vendor quotations/payments,
-- documents, notifications, subscriptions, payments

--> statement-breakpoint

-- 1. Create new enums

DO $$ BEGIN
  CREATE TYPE public.quotation_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE public.notification_type AS ENUM ('TASK_REMINDER', 'DUE_DATE', 'BUDGET_ALERT', 'INVITATION', 'SYSTEM');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE public.notification_read AS ENUM ('UNREAD', 'READ');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE public.subscription_status AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED', 'REFUNDED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

--> statement-breakpoint

-- 2. Add category_id column to tasks table

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS category_id uuid;

--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'tasks_category_fk'
  ) THEN
    ALTER TABLE public.tasks
      ADD CONSTRAINT tasks_category_fk
      FOREIGN KEY (workspace_id, category_id)
      REFERENCES public.task_categories (workspace_id, id)
      ON DELETE SET NULL;
  END IF;
END
$$;

--> statement-breakpoint

-- 3. Create task_categories table

CREATE TABLE IF NOT EXISTS public.task_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.wedding_workspaces (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  color text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (workspace_id, name)
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS task_categories_workspace_name_uidx ON public.task_categories (workspace_id, name);

--> statement-breakpoint

ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;

--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'task_categories_owner_read') THEN
    CREATE POLICY task_categories_owner_read ON public.task_categories
      FOR SELECT TO sewaka_app
      USING (
        workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
        AND public.has_workspace_role(
          workspace_id,
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      );
  END IF;
END $$;

--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'task_categories_owner_write') THEN
    CREATE POLICY task_categories_owner_write ON public.task_categories
      FOR ALL TO sewaka_app
      USING (
        workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
        AND public.has_workspace_role(
          workspace_id,
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      )
      WITH CHECK (
        workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
        AND public.has_workspace_role(
          workspace_id,
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      );
  END IF;
END $$;

--> statement-breakpoint

-- 4. Create checklist_templates table

CREATE TABLE IF NOT EXISTS public.checklist_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  milestone text NOT NULL,
  description text,
  tasks jsonb NOT NULL,
  is_default text NOT NULL DEFAULT 'true',
  created_at timestamp with time zone DEFAULT now()
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS checklist_templates_milestone_idx ON public.checklist_templates (milestone);

--> statement-breakpoint

-- 5. Create template_tasks table

CREATE TABLE IF NOT EXISTS public.template_tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid NOT NULL REFERENCES public.checklist_templates (id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category_id uuid,
  offset_days integer NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS template_tasks_template_idx ON public.template_tasks (template_id);

--> statement-breakpoint

-- 6. Create vendor_quotations table

CREATE TABLE IF NOT EXISTS public.vendor_quotations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.wedding_workspaces (id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES public.vendors (id) ON DELETE CASCADE,
  quotation_number text,
  amount numeric(14, 2) NOT NULL,
  description text,
  status public.quotation_status NOT NULL DEFAULT 'PENDING',
  quoted_date timestamp with time zone,
  valid_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CHECK (amount >= 0)
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS vendor_quotations_vendor_idx ON public.vendor_quotations (workspace_id, vendor_id);

--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'vendor_quotations_workspace_vendor_fk'
  ) THEN
    ALTER TABLE public.vendor_quotations
      ADD CONSTRAINT vendor_quotations_workspace_vendor_fk
      FOREIGN KEY (workspace_id, vendor_id)
      REFERENCES public.vendors (workspace_id, id);
  END IF;
END
$$;

--> statement-breakpoint

ALTER TABLE public.vendor_quotations ENABLE ROW LEVEL SECURITY;

--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vendor_quotations_owner_read') THEN
    CREATE POLICY vendor_quotations_owner_read ON public.vendor_quotations
      FOR SELECT TO sewaka_app
      USING (
        workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
        AND public.has_workspace_role(
          workspace_id,
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      );
  END IF;
END $$;

--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vendor_quotations_owner_write') THEN
    CREATE POLICY vendor_quotations_owner_write ON public.vendor_quotations
      FOR ALL TO sewaka_app
      USING (
        workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
        AND public.has_workspace_role(
          workspace_id,
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      )
      WITH CHECK (
        workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
        AND public.has_workspace_role(
          workspace_id,
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      );
  END IF;
END $$;

--> statement-breakpoint

-- 7. Create vendor_payments table

CREATE TABLE IF NOT EXISTS public.vendor_payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.wedding_workspaces (id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES public.vendors (id) ON DELETE CASCADE,
  quotation_id uuid REFERENCES public.vendor_quotations (id) ON DELETE SET NULL,
  amount numeric(14, 2) NOT NULL,
  payment_type text NOT NULL DEFAULT 'DP',
  payment_date timestamp with time zone NOT NULL DEFAULT now(),
  note text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CHECK (amount >= 0)
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS vendor_payments_vendor_idx ON public.vendor_payments (workspace_id, vendor_id);

--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'vendor_payments_workspace_vendor_fk'
  ) THEN
    ALTER TABLE public.vendor_payments
      ADD CONSTRAINT vendor_payments_workspace_vendor_fk
      FOREIGN KEY (workspace_id, vendor_id)
      REFERENCES public.vendors (workspace_id, id);
  END IF;
END
$$;

--> statement-breakpoint

ALTER TABLE public.vendor_payments ENABLE ROW LEVEL SECURITY;

--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vendor_payments_owner_read') THEN
    CREATE POLICY vendor_payments_owner_read ON public.vendor_payments
      FOR SELECT TO sewaka_app
      USING (
        workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
        AND public.has_workspace_role(
          workspace_id,
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      );
  END IF;
END $$;

--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vendor_payments_owner_write') THEN
    CREATE POLICY vendor_payments_owner_write ON public.vendor_payments
      FOR ALL TO sewaka_app
      USING (
        workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
        AND public.has_workspace_role(
          workspace_id,
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      )
      WITH CHECK (
        workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
        AND public.has_workspace_role(
          workspace_id,
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      );
  END IF;
END $$;

--> statement-breakpoint

-- 8. Create documents table

CREATE TABLE IF NOT EXISTS public.documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.wedding_workspaces (id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  file_path text NOT NULL,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  uploaded_by_id uuid REFERENCES public.users (id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  CHECK (file_size > 0)
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS documents_workspace_category_idx ON public.documents (workspace_id, category);

--> statement-breakpoint

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'documents_owner_read') THEN
    CREATE POLICY documents_owner_read ON public.documents
      FOR SELECT TO sewaka_app
      USING (
        workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
        AND public.has_workspace_role(
          workspace_id,
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      );
  END IF;
END $$;

--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'documents_owner_write') THEN
    CREATE POLICY documents_owner_write ON public.documents
      FOR ALL TO sewaka_app
      USING (
        workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
        AND public.has_workspace_role(
          workspace_id,
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      )
      WITH CHECK (
        workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
        AND public.has_workspace_role(
          workspace_id,
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      );
  END IF;
END $$;

--> statement-breakpoint

-- 9. Create notifications table

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.wedding_workspaces (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read public.notification_read NOT NULL DEFAULT 'UNREAD',
  entity_type text,
  entity_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS notifications_user_read_idx ON public.notifications (workspace_id, user_id, read);

--> statement-breakpoint

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'notifications_owner_read') THEN
    CREATE POLICY notifications_owner_read ON public.notifications
      FOR SELECT TO sewaka_app
      USING (
        workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
        AND public.has_workspace_role(
          workspace_id,
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      );
  END IF;
END $$;

--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'notifications_owner_write') THEN
    CREATE POLICY notifications_owner_write ON public.notifications
      FOR ALL TO sewaka_app
      USING (
        workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
        AND public.has_workspace_role(
          workspace_id,
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      )
      WITH CHECK (
        workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
        AND public.has_workspace_role(
          workspace_id,
          nullif(current_setting('app.user_id', true), '')::uuid,
          ARRAY['OWNER']::text[]
        )
      );
  END IF;
END $$;

--> statement-breakpoint

-- 10. Create subscription_plans table

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  price numeric(14, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'IDR',
  duration_months integer,
  max_vendors integer,
  max_guests integer,
  max_storage_bytes integer,
  features jsonb,
  is_active text NOT NULL DEFAULT 'true',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CHECK (price >= 0)
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS subscription_plans_active_order_idx ON public.subscription_plans (is_active, sort_order);

--> statement-breakpoint

-- 11. Create subscriptions table

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL UNIQUE REFERENCES public.wedding_workspaces (id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans (id) ON DELETE RESTRICT,
  status public.subscription_status NOT NULL DEFAULT 'ACTIVE',
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  auto_renew text NOT NULL DEFAULT 'true',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS subscriptions_status_expire_idx ON public.subscriptions (status, expires_at);

--> statement-breakpoint

-- 12. Create payment_transactions table

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id uuid NOT NULL REFERENCES public.subscriptions (id) ON DELETE CASCADE,
  external_id text UNIQUE,
  amount numeric(14, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'IDR',
  status public.payment_status NOT NULL DEFAULT 'PENDING',
  gateway text,
  metadata jsonb,
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CHECK (amount >= 0)
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS payment_transactions_subscription_idx ON public.payment_transactions (subscription_id);

--> statement-breakpoint

-- 13. Grant usage on new enums to sewaka_app

GRANT USAGE ON TYPE public.quotation_status TO sewaka_app;
GRANT USAGE ON TYPE public.notification_type TO sewaka_app;
GRANT USAGE ON TYPE public.notification_read TO sewaka_app;
GRANT USAGE ON TYPE public.subscription_status TO sewaka_app;
GRANT USAGE ON TYPE public.payment_status TO sewaka_app;

--> statement-breakpoint

-- 14. Grant table permissions to sewaka_app

GRANT ALL ON public.task_categories TO sewaka_app;
GRANT ALL ON public.checklist_templates TO sewaka_app;
GRANT ALL ON public.template_tasks TO sewaka_app;
GRANT ALL ON public.vendor_quotations TO sewaka_app;
GRANT ALL ON public.vendor_payments TO sewaka_app;
GRANT ALL ON public.documents TO sewaka_app;
GRANT ALL ON public.notifications TO sewaka_app;
GRANT ALL ON public.subscription_plans TO sewaka_app;
GRANT ALL ON public.subscriptions TO sewaka_app;
GRANT ALL ON public.payment_transactions TO sewaka_app;

--> statement-breakpoint

-- 15. Grant RLS role access to new tables

GRANT SELECT ON public.task_categories TO sewaka_rls;
GRANT SELECT ON public.vendor_quotations TO sewaka_rls;
GRANT SELECT ON public.vendor_payments TO sewaka_rls;
GRANT SELECT ON public.documents TO sewaka_rls;
GRANT SELECT ON public.notifications TO sewaka_rls;
