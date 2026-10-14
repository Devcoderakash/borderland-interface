-- ==============================================================================
-- APEX 1.0: Registration Confirmation Email Logging & Idempotency Table
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/vnawxsgxcobfcbywykdb/sql
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.registration_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  player_id text NOT NULL,
  recipient_email text NOT NULL,
  email_type text NOT NULL DEFAULT 'registration_confirmation',
  provider text NOT NULL DEFAULT 'resend',
  provider_message_id text,
  status text NOT NULL DEFAULT 'queued', -- queued, sent, delivered, failed
  attempt_count int NOT NULL DEFAULT 1,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT registration_emails_team_type_unique UNIQUE (team_id, email_type)
);

CREATE INDEX IF NOT EXISTS registration_emails_team_id_idx ON public.registration_emails (team_id);
CREATE INDEX IF NOT EXISTS registration_emails_player_id_idx ON public.registration_emails (player_id);
CREATE INDEX IF NOT EXISTS registration_emails_status_idx ON public.registration_emails (status);

ALTER TABLE public.registration_emails ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.registration_emails TO service_role;
GRANT SELECT ON public.registration_emails TO anon, authenticated;

DROP POLICY IF EXISTS "Service role full access on registration_emails" ON public.registration_emails;
CREATE POLICY "Service role full access on registration_emails"
  ON public.registration_emails FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select on registration_emails" ON public.registration_emails;
CREATE POLICY "Allow public select on registration_emails"
  ON public.registration_emails FOR SELECT TO anon, authenticated
  USING (true);
