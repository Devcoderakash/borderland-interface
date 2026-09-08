CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
CREATE TYPE public.suit_type AS ENUM ('spades','diamonds','clubs','hearts');
CREATE TYPE public.team_status AS ENUM ('pending','approved','rejected');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE SEQUENCE public.player_id_seq START 1000;

CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id text NOT NULL UNIQUE DEFAULT ('BL-' || lpad(nextval('public.player_id_seq')::text, 4, '0')),
  team_name text NOT NULL,
  leader_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  college text NOT NULL,
  team_size int NOT NULL DEFAULT 2,
  suit public.suit_type NOT NULL,
  preferred_domain text,
  github_url text,
  linkedin_url text,
  status public.team_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.teams TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.teams TO authenticated;
GRANT ALL ON public.teams TO service_role;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can register a team" ON public.teams FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read teams" ON public.teams FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update teams" ON public.teams FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete teams" ON public.teams FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  position int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.team_members TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can add members" ON public.team_members FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read members" ON public.team_members FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage members" ON public.team_members FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rank int NOT NULL,
  team_name text NOT NULL,
  suit public.suit_type NOT NULL,
  score int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'SURVIVED',
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.leaderboard TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.leaderboard TO authenticated;
GRANT ALL ON public.leaderboard TO service_role;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published leaderboard is public" ON public.leaderboard FOR SELECT TO anon, authenticated USING (published = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins insert leaderboard" ON public.leaderboard FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update leaderboard" ON public.leaderboard FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete leaderboard" ON public.leaderboard FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER leaderboard_updated_at BEFORE UPDATE ON public.leaderboard FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.event_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL DEFAULT 'BORDER//LAND',
  event_date text NOT NULL DEFAULT '14-15 MARCH 2026',
  venue text NOT NULL DEFAULT 'BORDER//LAND HQ, BHOPAL, MADHYA PRADESH',
  registration_deadline text NOT NULL DEFAULT '10 MARCH 2026',
  prize_pool text NOT NULL DEFAULT '90000',
  contact_email text NOT NULL DEFAULT 'protocol@borderland.dev',
  contact_phone text NOT NULL DEFAULT '+91 00000 00000',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.event_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.event_settings TO authenticated;
GRANT ALL ON public.event_settings TO service_role;
ALTER TABLE public.event_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "event settings are public" ON public.event_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins insert settings" ON public.event_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update settings" ON public.event_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.event_settings (id) VALUES (gen_random_uuid());

INSERT INTO public.leaderboard (rank, team_name, suit, score, status) VALUES
 (1,'Team Nova','diamonds',980,'SURVIVED'),
 (2,'CodeX','clubs',920,'SURVIVED'),
 (3,'ByteForce','spades',875,'SURVIVED'),
 (4,'Null Pointer','hearts',840,'SURVIVED'),
 (5,'Quantum Drift','diamonds',805,'AT RISK'),
 (6,'Silent Protocol','clubs',770,'AT RISK'),
 (7,'Iron Syntax','spades',735,'ELIMINATED'),
 (8,'Echo Nine','hearts',690,'ELIMINATED');