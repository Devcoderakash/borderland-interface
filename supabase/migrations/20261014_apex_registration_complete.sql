-- ============================================================
-- APEX 1.0 — COMPLETE ALL-IN-ONE SUPABASE DATABASE SETUP
-- Safe for fresh databases and existing databases alike.
-- Run this script in the Supabase SQL Editor.
-- ============================================================

-- 1. Create Enums safely
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.suit_type AS ENUM ('spades', 'diamonds', 'clubs', 'hearts');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.team_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Utility functions and sequence
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE SEQUENCE IF NOT EXISTS public.player_id_seq START 1000;

-- 3. User roles table & has_role function
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "own roles readable" ON public.user_roles;
  CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- 4. Create public.teams table with all columns
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id text NOT NULL UNIQUE DEFAULT ('APEX-' || lpad(nextval('public.player_id_seq')::text, 4, '0')),
  team_name text NOT NULL,
  leader_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  college text NOT NULL DEFAULT '',
  team_size int NOT NULL DEFAULT 2,
  suit public.suit_type NOT NULL DEFAULT 'spades',
  preferred_domain text,
  github_url text,
  linkedin_url text,
  status public.team_status NOT NULL DEFAULT 'pending',
  ppt_url text,
  ppt_file_name text,
  ppt_file_type text,
  ppt_file_size bigint,
  ppt_storage_path text,
  payment_status text NOT NULL DEFAULT 'pending',
  payment_id text,
  razorpay_order_id text,
  payment_order_id text,
  cashfree_order_id text,
  payment_signature text,
  payment_amount integer,
  payment_currency text DEFAULT 'INR',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure all columns exist even if public.teams was previously created with fewer columns
ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS player_id text DEFAULT ('APEX-' || lpad(nextval('public.player_id_seq')::text, 4, '0')),
  ADD COLUMN IF NOT EXISTS team_name text,
  ADD COLUMN IF NOT EXISTS leader_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS college text DEFAULT '',
  ADD COLUMN IF NOT EXISTS team_size int DEFAULT 2,
  ADD COLUMN IF NOT EXISTS suit public.suit_type DEFAULT 'spades',
  ADD COLUMN IF NOT EXISTS preferred_domain text,
  ADD COLUMN IF NOT EXISTS github_url text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS status public.team_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS ppt_url text,
  ADD COLUMN IF NOT EXISTS ppt_file_name text,
  ADD COLUMN IF NOT EXISTS ppt_file_type text,
  ADD COLUMN IF NOT EXISTS ppt_file_size bigint,
  ADD COLUMN IF NOT EXISTS ppt_storage_path text,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_id text,
  ADD COLUMN IF NOT EXISTS razorpay_order_id text,
  ADD COLUMN IF NOT EXISTS payment_order_id text,
  ADD COLUMN IF NOT EXISTS cashfree_order_id text,
  ADD COLUMN IF NOT EXISTS payment_signature text,
  ADD COLUMN IF NOT EXISTS payment_amount integer,
  ADD COLUMN IF NOT EXISTS payment_currency text DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 5. Create team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  position int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Create event_settings table
CREATE TABLE IF NOT EXISTS public.event_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL DEFAULT 'APEX 1.0',
  event_date text NOT NULL DEFAULT '2026',
  venue text NOT NULL DEFAULT 'Bhopal, Madhya Pradesh',
  registration_deadline text NOT NULL DEFAULT '2026',
  prize_pool text NOT NULL DEFAULT '30000',
  contact_email text NOT NULL DEFAULT 'support@apex1.dev',
  contact_phone text NOT NULL DEFAULT '+91 00000 00000',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert default event settings row if table is empty
INSERT INTO public.event_settings (event_name, prize_pool)
SELECT 'APEX 1.0', '30000'
WHERE NOT EXISTS (SELECT 1 FROM public.event_settings);

-- 7. Trigger for updated_at on teams
DROP TRIGGER IF EXISTS teams_updated_at ON public.teams;
CREATE TRIGGER teams_updated_at
BEFORE UPDATE ON public.teams
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Indexes for performance and uniqueness
CREATE INDEX IF NOT EXISTS teams_email_idx          ON public.teams (email);
CREATE INDEX IF NOT EXISTS teams_player_id_idx      ON public.teams (player_id);
CREATE INDEX IF NOT EXISTS teams_razorpay_ord_idx   ON public.teams (razorpay_order_id);
CREATE INDEX IF NOT EXISTS teams_payment_ord_idx    ON public.teams (payment_order_id);
CREATE INDEX IF NOT EXISTS teams_payment_status_idx ON public.teams (payment_status);
CREATE INDEX IF NOT EXISTS teams_created_at_idx     ON public.teams (created_at DESC);

-- Unique index to prevent duplicate paid registrations
CREATE UNIQUE INDEX IF NOT EXISTS teams_email_paid_unique_idx
  ON public.teams (email)
  WHERE payment_status = 'paid';

-- 9. Storage Bucket setup (apex-presentations)
-- Configures private bucket with 20MB limit and PDF/PPT/PPTX support
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'apex-presentations',
  'apex-presentations',
  false,
  20971520,
  ARRAY[
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

-- 10. Table Permissions & Row-Level Security
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_settings ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.teams TO service_role;
GRANT ALL ON public.team_members TO service_role;
GRANT ALL ON public.event_settings TO service_role;

GRANT SELECT ON public.event_settings TO anon, authenticated;

-- Service role full access policies
DROP POLICY IF EXISTS "Service role full access on teams" ON public.teams;
CREATE POLICY "Service role full access on teams"
  ON public.teams FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on team_members" ON public.team_members;
CREATE POLICY "Service role full access on team_members"
  ON public.team_members FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "event settings are readable" ON public.event_settings;
CREATE POLICY "event settings are readable"
  ON public.event_settings FOR SELECT TO anon, authenticated
  USING (true);

-- 11. Verification check
SELECT count(*) AS total_teams FROM public.teams;
