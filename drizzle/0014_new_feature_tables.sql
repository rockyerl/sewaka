-- Migration: Add new feature tables (recurring_tasks, expense_attachments, support_tickets, support_ticket_messages, admin_contents)

--> statement-breakpoint

-- 1. Create recurring_tasks table (TSK-11)

CREATE TABLE IF NOT EXISTS public.recurring_tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.wedding_workspaces (id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  notes text,
  priority text NOT NULL DEFAULT 'MEDIUM',
  category_id uuid REFERENCES public.task_categories (id) ON DELETE SET NULL,
  recurrence_pattern text NOT NULL,
  recurrence_interval integer NOT NULL DEFAULT 1,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  last_generated_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS recurring_tasks_workspace_idx ON public.recurring_tasks (workspace_id);

--> statement-breakpoint

ALTER TABLE public.recurring_tasks ENABLE ROW LEVEL SECURITY;

--> statement-breakpoint

-- 2. Create expense_attachments table (BGT-13)

CREATE TABLE IF NOT EXISTS public.expense_attachments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id uuid NOT NULL REFERENCES public.expenses (id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.wedding_workspaces (id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  uploaded_by uuid NOT NULL REFERENCES public.users (id),
  created_at timestamp with time zone DEFAULT now()
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS expense_attachments_expense_idx ON public.expense_attachments (expense_id);

--> statement-breakpoint

ALTER TABLE public.expense_attachments ENABLE ROW LEVEL SECURITY;

--> statement-breakpoint

-- 3. Create support_tickets table (ADM-06)

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES public.wedding_workspaces (id) ON DELETE SET NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'OPEN',
  priority text NOT NULL DEFAULT 'MEDIUM',
  category text NOT NULL,
  assigned_to_id uuid REFERENCES public.users (id) ON DELETE SET NULL,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS support_tickets_user_idx ON public.support_tickets (user_id);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON public.support_tickets (status);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS support_tickets_created_idx ON public.support_tickets (created_at);

--> statement-breakpoint

-- 4. Create support_ticket_messages table (ADM-06)

CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id uuid NOT NULL REFERENCES public.support_tickets (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  message text NOT NULL,
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS support_ticket_messages_ticket_idx ON public.support_ticket_messages (ticket_id);

--> statement-breakpoint

-- 5. Create admin_contents table (ADM-05)

CREATE TABLE IF NOT EXISTS public.admin_contents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content jsonb NOT NULL,
  metadata jsonb,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL REFERENCES public.users (id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS admin_contents_type_idx ON public.admin_contents (type);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS admin_contents_active_idx ON public.admin_contents (is_active);

--> statement-breakpoint
