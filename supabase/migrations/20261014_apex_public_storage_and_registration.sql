-- ==============================================================================
-- APEX 1.0: Enable Direct Supabase Storage Upload & Public Team Registration
-- Run this in the Supabase Dashboard SQL Editor (https://supabase.com/dashboard/project/vnawxsgxcobfcbywykdb/sql)
-- ==============================================================================

-- 1. Ensure apex-presentations bucket is configured with 20MB limit and public access
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'apex-presentations',
  'apex-presentations',
  true,
  20971520,
  ARRAY[
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

-- 2. Storage Policies: Allow participants to upload their PPT/PDF directly to Supabase
DROP POLICY IF EXISTS "Allow public uploads to apex-presentations" ON storage.objects;
CREATE POLICY "Allow public uploads to apex-presentations"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'apex-presentations');

DROP POLICY IF EXISTS "Allow public select from apex-presentations" ON storage.objects;
CREATE POLICY "Allow public select from apex-presentations"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'apex-presentations');

DROP POLICY IF EXISTS "Allow public update to apex-presentations" ON storage.objects;
CREATE POLICY "Allow public update to apex-presentations"
ON storage.objects FOR UPDATE TO anon, authenticated
USING (bucket_id = 'apex-presentations');

-- 3. Public Teams Policies: Allow participants to insert registrations and read confirmation
DROP POLICY IF EXISTS "Allow anon insert to teams" ON public.teams;
CREATE POLICY "Allow anon insert to teams"
ON public.teams FOR INSERT TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon select from teams" ON public.teams;
CREATE POLICY "Allow anon select from teams"
ON public.teams FOR SELECT TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow anon update teams" ON public.teams;
CREATE POLICY "Allow anon update teams"
ON public.teams FOR UPDATE TO anon, authenticated
USING (true);

-- 4. Public Team Members Policies: Allow inserting team members
DROP POLICY IF EXISTS "Allow anon insert to team_members" ON public.team_members;
CREATE POLICY "Allow anon insert to team_members"
ON public.team_members FOR INSERT TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon select from team_members" ON public.team_members;
CREATE POLICY "Allow anon select from team_members"
ON public.team_members FOR SELECT TO anon, authenticated
USING (true);
