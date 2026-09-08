DROP POLICY "published leaderboard is public" ON public.leaderboard;
CREATE POLICY "published leaderboard is public" ON public.leaderboard FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "admins read all leaderboard" ON public.leaderboard FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;