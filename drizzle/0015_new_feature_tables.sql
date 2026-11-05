-- Migration: Add new feature tables (push_notification_subscriptions, calendar_syncs, whatsapp_notifications)

--> statement-breakpoint

-- 1. Create push_notification_subscriptions table (COL-07)

CREATE TABLE IF NOT EXISTS public.push_notification_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS push_notification_subscriptions_user_idx ON public.push_notification_subscriptions (user_id);

--> statement-breakpoint

-- 2. Create calendar_syncs table (CAL-06)

CREATE TABLE IF NOT EXISTS public.calendar_syncs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.wedding_workspaces (id) ON DELETE CASCADE,
  provider text NOT NULL,
  calendar_id text NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  sync_direction text NOT NULL DEFAULT 'BIDIRECTIONAL',
  is_active boolean NOT NULL DEFAULT true,
  last_sync_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS calendar_syncs_user_idx ON public.calendar_syncs (user_id);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS calendar_syncs_workspace_idx ON public.calendar_syncs (workspace_id);

--> statement-breakpoint

ALTER TABLE public.calendar_syncs ENABLE ROW LEVEL SECURITY;

--> statement-breakpoint

-- 3. Create whatsapp_notifications table (COL-08)

CREATE TABLE IF NOT EXISTS public.whatsapp_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  task_reminders boolean NOT NULL DEFAULT true,
  budget_alerts boolean NOT NULL DEFAULT true,
  event_reminders boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

--> statement-breakpoint

CREATE INDEX IF NOT EXISTS whatsapp_notifications_user_idx ON public.whatsapp_notifications (user_id);
