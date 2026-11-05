-- 0008_cultural_features.sql
-- Penambahan fitur budaya: Rundown prosesi adat, E-Invitation adat, dan Onboarding budaya

ALTER TABLE public.wedding_workspaces ADD COLUMN IF NOT EXISTS cultural_tradition text DEFAULT 'JAWA';
ALTER TABLE public.wedding_workspaces ADD COLUMN IF NOT EXISTS invitation_slug text UNIQUE;
ALTER TABLE public.wedding_workspaces ADD COLUMN IF NOT EXISTS invitation_quote text;
ALTER TABLE public.wedding_workspaces ADD COLUMN IF NOT EXISTS dress_code text;
ALTER TABLE public.wedding_workspaces ADD COLUMN IF NOT EXISTS story text;

ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS invitation_code text;
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS wishes text;
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS checked_in boolean DEFAULT false NOT NULL;
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS checked_in_at timestamp with time zone;

CREATE TABLE IF NOT EXISTS public.cultural_rundowns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES public.wedding_workspaces(id) ON DELETE CASCADE,
    event_id uuid REFERENCES public.wedding_events(id) ON DELETE SET NULL,
    title text NOT NULL,
    ceremony_type text,
    time_start text NOT NULL,
    time_end text NOT NULL,
    pic_name text,
    location text,
    attire text,
    rituals jsonb,
    notes text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.cultural_rundowns ENABLE ROW LEVEL SECURITY;

CREATE POLICY cultural_rundowns_read
ON public.cultural_rundowns
FOR SELECT
TO sewaka_app
USING (
    workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
    AND public.has_workspace_role(
        workspace_id,
        nullif(current_setting('app.user_id', true), '')::uuid,
        null
    )
);

CREATE POLICY cultural_rundowns_write
ON public.cultural_rundowns
FOR ALL
TO sewaka_app
USING (
    workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
    AND public.has_workspace_role(
        workspace_id,
        nullif(current_setting('app.user_id', true), '')::uuid,
        ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
)
WITH CHECK (
    workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
    AND public.has_workspace_role(
        workspace_id,
        nullif(current_setting('app.user_id', true), '')::uuid,
        ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cultural_rundowns TO sewaka_app;
