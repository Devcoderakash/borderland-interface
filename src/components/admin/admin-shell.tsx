import { Link, useNavigate } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { Loader2, LogOut } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { SystemLabel } from "@/components/site/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_NAV = [
  { to: "/admin", label: "OVERVIEW" },
  { to: "/admin/registrations", label: "REGISTRATIONS" },
  { to: "/admin/leaderboard", label: "LEADERBOARD" },
] as const;

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    const check = async (s: Session | null) => {
      if (!active) return;
      setSession(s);
      if (!s) {
        setIsAdmin(null);
        setChecking(false);
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", s.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!active) return;
      setIsAdmin(Boolean(data));
      setChecking(false);
    };

    supabase.auth.getSession().then(({ data }) => check(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      void check(s);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(null);
    navigate({ to: "/admin", replace: true });
  };

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return <AdminLogin />;

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-5">
        <div className="glass-panel max-w-md rounded-xl p-8 text-center">
          <SystemLabel className="text-primary">ACCESS DENIED</SystemLabel>
          <h1 className="mt-3 font-display text-2xl font-black uppercase">Not an operator</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This account is signed in but has no operator clearance for the control room.
          </p>
          <Button onClick={signOut} className="mt-6 font-mono text-xs tracking-[0.18em]">
            SIGN OUT
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 sm:px-8">
          <div className="flex min-w-0 items-center gap-6">
            <Link to="/" className="shrink-0 font-display text-sm font-black tracking-widest">
              BORDER<span className="text-primary">//</span>LAND
            </Link>
            <nav aria-label="Admin" className="hidden gap-1 md:flex">
              {ADMIN_NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="rounded px-3 py-1.5 font-mono text-[0.68rem] tracking-[0.16em] text-muted-foreground hover:text-foreground"
                  activeProps={{ className: "text-foreground bg-secondary" }}
                  activeOptions={{ exact: n.to === "/admin" }}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <Button
            onClick={signOut}
            variant="outline"
            size="sm"
            className="bg-transparent font-mono text-[0.68rem] tracking-[0.16em]"
          >
            <LogOut className="mr-2 h-3.5 w-3.5" /> SIGN OUT
          </Button>
        </div>
        <nav aria-label="Admin mobile" className="flex gap-1 overflow-x-auto px-5 pb-2 md:hidden">
          {ADMIN_NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="whitespace-nowrap rounded px-3 py-1.5 font-mono text-[0.68rem] tracking-[0.16em] text-muted-foreground"
              activeProps={{ className: "text-foreground bg-secondary" }}
              activeOptions={{ exact: n.to === "/admin" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <SystemLabel className="text-primary">CONTROL ROOM</SystemLabel>
        <h1 className="mt-2 font-display text-3xl font-black uppercase sm:text-4xl">{title}</h1>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error("ACCESS DENIED", { description: error.message });
      return;
    }
    toast.success("ACCESS GRANTED");
  };

  return (
    <div className="grid min-h-screen place-items-center void-bg px-5">
      <form onSubmit={submit} className="glass-panel w-full max-w-sm rounded-xl p-7">
        <SystemLabel className="text-primary">SECURITY_LEVEL: HIGH</SystemLabel>
        <h1 className="mt-3 font-display text-2xl font-black uppercase">Operator access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with your operator account to open the control room.
        </p>
        <div className="mt-6 grid gap-4">
          <div>
            <Label htmlFor="email" className="system-label">
              EMAIL
            </Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="password" className="system-label">
              PASSWORD
            </Label>
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <Button type="submit" disabled={busy} className="font-mono text-xs tracking-[0.18em]">
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} AUTHENTICATE
          </Button>
        </div>
      </form>
    </div>
  );
}
