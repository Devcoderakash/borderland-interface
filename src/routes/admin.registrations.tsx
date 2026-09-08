import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Download, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/admin-shell";
import { StatusChip, SystemLabel } from "@/components/site/bits";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { SUITS, suitBySymbol, type SuitKey } from "@/lib/borderland";

type Team = {
  id: string;
  player_id: string;
  team_name: string;
  leader_name: string;
  email: string;
  phone: string;
  college: string;
  team_size: number;
  suit: SuitKey;
  status: "pending" | "approved" | "rejected";
  preferred_domain: string | null;
  created_at: string;
};

export const Route = createFileRoute("/admin/registrations")({
  head: () => ({
    meta: [
      { title: "Registrations — BORDER//LAND Admin" },
      { name: "description", content: "Review, approve and export BORDER//LAND team registrations." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Registrations — BORDER//LAND Admin" },
      { property: "og:description", content: "Team registration management." },
    ],
  }),
  component: () => (
    <AdminShell title="Registrations">
      <Registrations />
    </AdminShell>
  ),
});

function Registrations() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [suit, setSuit] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [editing, setEditing] = useState<Team | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "registrations"],
    queryFn: async (): Promise<Team[]> => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Team[];
    },
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin", "registrations"] });
    void qc.invalidateQueries({ queryKey: ["admin", "teams"] });
  };

  const setStatusMutation = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: Team["status"] }) => {
      const { error } = await supabase.from("teams").update({ status: next }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(`TEAM ${v.next.toUpperCase()}`);
      invalidate();
    },
    onError: (e: Error) => toast.error("UPDATE FAILED", { description: e.message }),
  });

  const saveEdit = useMutation({
    mutationFn: async (team: Team) => {
      const { error } = await supabase
        .from("teams")
        .update({
          team_name: team.team_name,
          leader_name: team.leader_name,
          email: team.email,
          phone: team.phone,
          college: team.college,
          team_size: team.team_size,
          suit: team.suit,
          status: team.status,
        })
        .eq("id", team.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("REGISTRATION UPDATED");
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => toast.error("UPDATE FAILED", { description: e.message }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("teams").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("REGISTRATION DELETED");
      invalidate();
    },
    onError: (e: Error) => toast.error("DELETE FAILED", { description: e.message }),
  });

  const rows = (data ?? []).filter(
    (t) =>
      (suit === "all" || t.suit === suit) &&
      (status === "all" || t.status === status) &&
      `${t.team_name} ${t.leader_name} ${t.email} ${t.college} ${t.player_id}`
        .toLowerCase()
        .includes(q.trim().toLowerCase()),
  );

  const exportCsv = () => {
    const header = [
      "player_id",
      "team_name",
      "leader_name",
      "email",
      "phone",
      "college",
      "team_size",
      "suit",
      "status",
      "created_at",
    ];
    const csv = [
      header.join(","),
      ...rows.map((r) =>
        header
          .map((h) => `"${String((r as unknown as Record<string, unknown>)[h] ?? "").replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "borderland-registrations.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="glass-panel grid gap-3 rounded-xl p-5 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg:items-center">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="SEARCH TEAM, LEADER, EMAIL, COLLEGE"
          aria-label="Search registrations"
          className="font-mono text-xs tracking-[0.12em]"
        />
        <Select value={suit} onValueChange={setSuit}>
          <SelectTrigger className="w-full lg:w-40" aria-label="Filter by suit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ALL SUITS</SelectItem>
            {SUITS.map((s) => (
              <SelectItem key={s.key} value={s.key}>
                {s.symbol} {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full lg:w-40" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["all", "pending", "approved", "rejected"].map((s) => (
              <SelectItem key={s} value={s}>
                {s.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={exportCsv}
          variant="outline"
          className="bg-transparent font-mono text-xs tracking-[0.16em]"
        >
          <Download className="mr-2 h-4 w-4" /> EXPORT
        </Button>
      </div>

      <div className="glass-panel overflow-x-auto rounded-xl p-5">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border/70">
              {[
                "PLAYER ID",
                "TEAM",
                "LEADER",
                "EMAIL",
                "COLLEGE",
                "MEMBERS",
                "SUIT",
                "STATUS",
                "REGISTERED AT",
                "ACTIONS",
              ].map((h) => (
                <th key={h} className="pb-3 pr-4">
                  <SystemLabel>{h}</SystemLabel>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={10} className="py-6">
                  <Skeleton className="h-24 w-full" />
                </td>
              </tr>
            ) : (
              rows.map((t) => (
                <tr key={t.id} className="border-b border-border/40 text-sm">
                  <td className="py-3 pr-4 font-mono text-xs text-primary">{t.player_id}</td>
                  <td className="py-3 pr-4 font-display font-bold tracking-[0.08em]">
                    {t.team_name}
                  </td>
                  <td className="py-3 pr-4">{t.leader_name}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{t.email}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{t.college}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{t.team_size}</td>
                  <td className="py-3 pr-4 text-lg">{suitBySymbol[t.suit]}</td>
                  <td className="py-3 pr-4">
                    <StatusChip status={t.status} />
                  </td>
                  <td className="py-3 pr-4 font-mono text-[0.7rem] text-muted-foreground">
                    {new Date(t.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex gap-1.5">
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Approve team"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => setStatusMutation.mutate({ id: t.id, next: "approved" })}
                      >
                        <Check className="h-3.5 w-3.5 text-club" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Reject team"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => setStatusMutation.mutate({ id: t.id, next: "rejected" })}
                      >
                        <X className="h-3.5 w-3.5 text-primary" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Edit registration"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => setEditing(t)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Delete registration"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => {
                          if (confirm(`Delete ${t.team_name}?`)) remove.mutate(t.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-primary" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!isLoading && rows.length === 0 ? (
          <p className="py-10 text-center system-label">NO REGISTRATIONS MATCH THIS FILTER</p>
        ) : null}
      </div>

      <Dialog open={Boolean(editing)} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">EDIT REGISTRATION</DialogTitle>
          </DialogHeader>
          {editing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["team_name", "TEAM NAME"],
                  ["leader_name", "LEADER"],
                  ["email", "EMAIL"],
                  ["phone", "PHONE"],
                  ["college", "COLLEGE"],
                ] as const
              ).map(([k, label]) => (
                <div key={k}>
                  <Label htmlFor={k} className="system-label">
                    {label}
                  </Label>
                  <Input
                    id={k}
                    className="mt-1.5"
                    value={editing[k]}
                    onChange={(e) => setEditing({ ...editing, [k]: e.target.value })}
                  />
                </div>
              ))}
              <div>
                <Label className="system-label">STATUS</Label>
                <Select
                  value={editing.status}
                  onValueChange={(v) => setEditing({ ...editing, status: v as Team["status"] })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["pending", "approved", "rejected"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              onClick={() => editing && saveEdit.mutate(editing)}
              disabled={saveEdit.isPending}
              className="font-mono text-xs tracking-[0.18em]"
            >
              SAVE CHANGES
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
