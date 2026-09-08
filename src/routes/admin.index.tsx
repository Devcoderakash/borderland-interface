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
import { SUITS } from "@/lib/borderland";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Control Room — BORDER//LAND Admin" },
      { name: "description", content: "Operator dashboard for BORDER//LAND registrations and standings." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Control Room — BORDER//LAND Admin" },
      { property: "og:description", content: "Operator dashboard." },
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
      const { data, error } = await supabase.from("teams").select("id, suit, status, team_size");
      if (error) throw error;
      return data ?? [];
    },
  });

  const settings = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async (): Promise<Settings | null> => {
      const { data, error } = await supabase
        .from("event_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Settings | null;
    },
  });

  const [form, setForm] = useState<Settings | null>(null);
  useEffect(() => {
    if (settings.data) setForm(settings.data);
  }, [settings.data]);

  const save = useMutation({
    mutationFn: async (values: Settings) => {
      const { id, ...rest } = values;
      const { error } = await supabase.from("event_settings").update(rest).eq("id", id);
      if (error) throw error;
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
    { label: "TOTAL TEAMS", value: rows.length },
    { label: "CONFIRMED TEAMS", value: rows.filter((r) => r.status === "approved").length },
    { label: "PENDING TEAMS", value: rows.filter((r) => r.status === "pending").length },
    { label: "TOTAL PARTICIPANTS", value: rows.reduce((a, r) => a + (r.team_size ?? 0), 0) },
  ];

  const chart = SUITS.map((s) => ({
    suit: s.name,
    teams: rows.filter((r) => r.suit === s.key).length,
  }));

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="glass-panel rounded-xl p-5">
            <SystemLabel>{s.label}</SystemLabel>
            <p className="mt-2 font-display text-3xl font-black text-primary">
              {teams.isLoading ? <Skeleton className="h-8 w-14" /> : s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-xl p-5 sm:p-6">
        <SystemLabel>TEAMS BY SUIT</SystemLabel>
        <div className="mt-5 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="suit" stroke="var(--color-muted-foreground)" fontSize={11} />
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

      <div className="glass-panel rounded-xl p-5 sm:p-6">
        <SystemLabel>EVENT SETTINGS</SystemLabel>
        {form ? (
          <form
            className="mt-5 grid gap-4 sm:grid-cols-2"
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
                <Label htmlFor={key} className="system-label">
                  {label}
                </Label>
                <Input
                  id={key}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <Button
                type="submit"
                disabled={save.isPending}
                className="font-mono text-xs tracking-[0.18em]"
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
