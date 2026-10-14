import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/admin-shell";
import { SystemLabel } from "@/components/site/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { getAdminRegistrations, getAdminSettings, updateAdminSettings } from "@/lib/api";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard — APEX 1.0 Admin" },
      { name: "description", content: "Admin dashboard for APEX 1.0 registrations and metrics." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Dashboard — APEX 1.0 Admin" },
      { property: "og:description", content: "Admin dashboard." },
    ],
  }),
  component: () => (
    <AdminShell title="Overview">
      <Overview />
    </AdminShell>
  ),
});

type Settings = {
  id: string;
  event_name: string;
  event_date: string;
  venue: string;
  registration_deadline: string;
  prize_pool: string;
  contact_email: string;
  contact_phone: string;
};

function Overview() {
  const qc = useQueryClient();

  const teams = useQuery({
    queryKey: ["admin", "teams"],
    queryFn: async () => {
      try {
        const data = await getAdminRegistrations();
        return data ?? [];
      } catch {
        const { data, error } = await supabase
          .from("teams")
          .select("id, status, team_size, preferred_domain, payment_status, payment_amount");
        if (error) throw error;
        return data ?? [];
      }
    },
  });

  const settings = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async (): Promise<Settings | null> => {
      try {
        const data = await getAdminSettings();
        return (data && Object.keys(data).length > 0 ? data : null) as Settings | null;
      } catch {
        const { data, error } = await supabase
          .from("event_settings")
          .select("*")
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        return data as Settings | null;
      }
    },
  });

  const [form, setForm] = useState<Settings | null>(null);
  useEffect(() => {
    if (settings.data) {
      setForm(settings.data);
    }
  }, [settings.data]);

  const save = useMutation({
    mutationFn: async (values: Settings) => {
      try {
        await updateAdminSettings(values);
      } catch {
        const { id, ...rest } = values;
        const { error } = await supabase.from("event_settings").update(rest).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("EVENT SETTINGS UPDATED");
      void qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
    onError: (e: Error) => toast.error("UPDATE FAILED", { description: e.message }),
  });

  const rows = teams.data ?? [];
  const stats = [
    { label: "TOTAL REGISTRATIONS", value: rows.length },
    { label: "PAID TEAMS", value: rows.filter((r) => r.payment_status === "paid").length },
    { label: "TOTAL REVENUE", value: `₹${rows.filter((r) => r.payment_status === "paid").reduce((a, r) => a + (r.payment_amount ?? 15000) / 100, 0)}` },
    { label: "APPROVED TEAMS", value: rows.filter((r) => r.status === "approved").length },
    { label: "TOTAL PARTICIPANTS", value: rows.reduce((a, r) => a + (r.team_size ?? 0), 0) },
  ];

  // Team Size Distribution
  const teamSizeChart = [2, 3, 4].map((size) => ({
    name: `${size} Members`,
    teams: rows.filter((r) => r.team_size === size).length,
  }));

  // Preferred Domain Distribution
  const domainCounts: Record<string, number> = {};
  rows.forEach((r) => {
    const domain = r.preferred_domain?.trim() || "General / Open";
    domainCounts[domain] = (domainCounts[domain] || 0) + 1;
  });
  const domainChart = Object.entries(domainCounts)
    .slice(0, 6)
    .map(([domain, count]) => ({
      domain,
      teams: count,
    }));

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="glass-panel rounded-xl p-4 sm:p-5 min-w-0">
            <SystemLabel className="text-[0.6rem] sm:text-xs truncate block">{s.label}</SystemLabel>
            <p className="mt-2 font-display text-xl sm:text-2xl lg:text-3xl font-black text-primary truncate">
              {teams.isLoading ? <Skeleton className="h-8 w-14" /> : s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel rounded-xl p-4 sm:p-6 min-w-0 overflow-hidden">
          <SystemLabel className="text-xs">TEAM SIZE DISTRIBUTION</SystemLabel>
          <div className="mt-5 h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamSizeChart}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="teams" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4 sm:p-6 min-w-0 overflow-hidden">
          <SystemLabel className="text-xs">PREFERRED DOMAIN DISTRIBUTION</SystemLabel>
          <div className="mt-5 h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainChart}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="domain" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="teams" fill="var(--color-accent)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl p-4 sm:p-6">
        <SystemLabel className="text-xs">EVENT SETTINGS</SystemLabel>
        {form ? (
          <form
            className="mt-5 grid gap-4 grid-cols-1 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate(form);
            }}
          >
            {(
              [
                ["event_name", "EVENT NAME"],
                ["event_date", "DATE"],
                ["venue", "VENUE"],
                ["registration_deadline", "REGISTRATION DEADLINE"],
                ["prize_pool", "PRIZE POOL (₹)"],
                ["contact_email", "CONTACT EMAIL"],
                ["contact_phone", "CONTACT PHONE"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <Label htmlFor={key} className="system-label text-xs">
                  {label}
                </Label>
                <Input
                  id={key}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="mt-1.5 h-10"
                />
              </div>
            ))}
            <div className="sm:col-span-2 pt-2">
              <Button
                type="submit"
                disabled={save.isPending}
                className="font-mono text-xs tracking-[0.18em] w-full sm:w-auto min-h-[44px]"
              >
                SAVE SETTINGS
              </Button>
            </div>
          </form>
        ) : (
          <Skeleton className="mt-5 h-32 w-full" />
        )}
      </div>
    </div>
  );
}
