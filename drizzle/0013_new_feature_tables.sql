-- Migration: Add new feature tables (image_gallery, vendor_contracts, invoices, wedding_concepts, comments, task_attachments, vendor_portfolio_images, document_shares)

--> statement-breakpoint

-- 1. Create comment_target_type enum

DO $$ BEGIN
  CREATE TYPE public.comment_target_type AS ENUM ('TASK', 'EVENT', 'DOCUMENT', 'VENDOR');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

--> statement-breakpoint

-- 2. Create image_gallery table (DOC-03)

CREATE TABLE IF NOT EXISTS public.image_gallery (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.wedding_workspaces (id) ON DELETE CASCADE,
  title text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  uploaded_by uuid NOT NULL REFERENCES public.users (id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS image_gallery_workspace_idx ON public.image_gallery (workspace_id);

--> statement-breakpoint

ALTER TABLE public.image_gallery ENABLE ROW LEVEL SECURITY;

--> statement-breakpoint

-- 3. Create vendor_contracts table (VND-09)

CREATE TABLE IF NOT EXISTS public.vendor_contracts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.wedding_workspaces (id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES public.vendors (id) ON DELETE CASCADE,
  title text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  signed_date timestamp with time zone,
  notes text,
  created_by uuid NOT NULL REFERENCES public.users (id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS vendor_contracts_workspace_idx ON public.vendor_contracts (workspace_id);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS vendor_contracts_vendor_idx ON public.vendor_contracts (vendor_id);

--> statement-breakpoint

ALTER TABLE public.vendor_contracts ENABLE ROW LEVEL SECURITY;

--> statement-breakpoint

-- 4. Create invoices table (SUB-09)

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.wedding_workspaces (id) ON DELETE CASCADE,
  subscription_id uuid NOT NULL REFERENCES public.subscriptions (id) ON DELETE CASCADE,
  invoice_number text NOT NULL UNIQUE,
  amount numeric(14, 2) NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  due_date timestamp with time zone NOT NULL,
  paid_at timestamp with time zone,
  file_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS invoices_workspace_idx ON public.invoices (workspace_id);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS invoices_subscription_idx ON public.invoices (subscription_id);

--> statement-breakpoint

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

--> statement-breakpoint

-- 5. Create wedding_concepts table (WKS-04)

CREATE TABLE IF NOT EXISTS public.wedding_concepts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL UNIQUE REFERENCES public.wedding_workspaces (id) ON DELETE CASCADE,
  theme text,
  color_palette jsonb,
  moodboard_images jsonb,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

--> statement-breakpoint

ALTER TABLE public.wedding_concepts ENABLE ROW LEVEL SECURITY;

--> statement-breakpoint

-- 6. Create comments table (COL-03)

CREATE TABLE IF NOT EXISTS public.comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.wedding_workspaces (id) ON DELETE CASCADE,
  target_id uuid NOT NULL,
  target_type comment_target_type NOT NULL,
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  content text NOT NULL,
  parent_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

--> statement-breakpoint

ALTER TABLE public.comments
  ADD CONSTRAINT comments_parent_fk
  FOREIGN KEY (parent_id) REFERENCES public.comments (id);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS comments_workspace_target_idx ON public.comments (workspace_id, target_id, target_type);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS comments_parent_idx ON public.comments (parent_id);

--> statement-breakpoint

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

--> statement-breakpoint

-- 7. Create task_attachments table (TSK-10)

CREATE TABLE IF NOT EXISTS public.task_attachments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES public.tasks (id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.wedding_workspaces (id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  uploaded_by uuid NOT NULL REFERENCES public.users (id),
  created_at timestamp with time zone DEFAULT now()
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS task_attachments_task_idx ON public.task_attachments (task_id);

--> statement-breakpoint

ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

--> statement-breakpoint

-- 8. Create vendor_portfolio_images table (VND-04)

CREATE TABLE IF NOT EXISTS public.vendor_portfolio_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id uuid NOT NULL REFERENCES public.vendors (id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.wedding_workspaces (id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS vendor_portfolio_vendor_idx ON public.vendor_portfolio_images (workspace_id, vendor_id);

--> statement-breakpoint

ALTER TABLE public.vendor_portfolio_images ENABLE ROW LEVEL SECURITY;

--> statement-breakpoint

-- 9. Create document_shares table (DOC-06)

CREATE TABLE IF NOT EXISTS public.document_shares (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid NOT NULL REFERENCES public.documents (id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.wedding_workspaces (id) ON DELETE CASCADE,
  share_code text NOT NULL UNIQUE,
  expires_at timestamp with time zone,
  created_by uuid NOT NULL REFERENCES public.users (id),
  created_at timestamp with time zone DEFAULT now()
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS document_shares_code_idx ON public.document_shares (share_code);

--> statement-breakpoint

ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;

--> statement-breakpoint

-- 10. Add notes column to tasks table (TSK-09)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.tasks ADD COLUMN notes text;
  END IF;
END $$;

--> statement-breakpoint
