import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Download, ExternalLink, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  getAdminPptSignedUrl,
  getAdminRegistrations,
  updateAdminTeamStatus,
  updateAdminTeam,
  deleteAdminTeam,
} from "@/lib/api";

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

type Team = {
  id: string;
  player_id: string;
  team_name: string;
  leader_name: string;
  email: string;
  phone: string;
  college: string;
  team_size: number;
  status: "pending" | "approved" | "rejected";
  preferred_domain: string | null;
  created_at: string;
  payment_status?: string;
  payment_id?: string;
  payment_order_id?: string;
  cashfree_order_id?: string;
  payment_amount?: number;
  ppt_storage_path?: string | null;
  ppt_file_name?: string | null;
};

export const Route = createFileRoute("/admin/registrations")({
  head: () => ({
    meta: [
      { title: "Registrations — APEX 1.0 Admin" },
      { name: "description", content: "Review, approve and export APEX 1.0 team registrations." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Registrations — APEX 1.0 Admin" },
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
  const [teamSizeFilter, setTeamSizeFilter] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [paymentStatus, setPaymentStatus] = useState<string>("all");
  const [editing, setEditing] = useState<Team | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "registrations"],
    queryFn: async (): Promise<Team[]> => {
      try {
        const teams = await getAdminRegistrations();
        return (teams ?? []) as Team[];
      } catch (backendErr) {
        // Fallback to direct supabase client
        const { data, error } = await supabase
          .from("teams")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw backendErr;
        return (data ?? []) as Team[];
      }
    },
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin", "registrations"] });
    void qc.invalidateQueries({ queryKey: ["admin", "teams"] });
  };

  const setStatusMutation = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: Team["status"] }) => {
      try {
        await updateAdminTeamStatus(id, next);
      } catch {
        const { error } = await supabase.from("teams").update({ status: next }).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("STATUS UPDATED");
      invalidate();
    },
    onError: (e: Error) => toast.error("STATUS UPDATE FAILED", { description: e.message }),
  });

  const saveEdit = useMutation({
    mutationFn: async (team: Team) => {
      try {
        await updateAdminTeam(team.id, {
          team_name: team.team_name,
          leader_name: team.leader_name,
          email: team.email,
          phone: team.phone,
          college: team.college,
          team_size: team.team_size,
          status: team.status,
          preferred_domain: team.preferred_domain,
        });
      } catch {
        const { error } = await supabase
          .from("teams")
          .update({
            team_name: team.team_name,
            leader_name: team.leader_name,
            email: team.email,
            phone: team.phone,
            college: team.college,
            team_size: team.team_size,
            status: team.status,
            preferred_domain: team.preferred_domain,
          })
          .eq("id", team.id);
        if (error) throw error;
      }
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
      try {
        await deleteAdminTeam(id);
      } catch {
        const { error } = await supabase.from("teams").delete().eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("REGISTRATION DELETED");
      invalidate();
    },
    onError: (e: Error) => toast.error("DELETE FAILED", { description: e.message }),
  });

  const rows = (data ?? []).filter(
    (t) =>
      (teamSizeFilter === "all" || String(t.team_size) === teamSizeFilter) &&
      (status === "all" || t.status === status) &&
      (paymentStatus === "all" || t.payment_status === paymentStatus) &&
      `${t.team_name} ${t.leader_name} ${t.email} ${t.college} ${t.player_id} ${t.preferred_domain ?? ""}`
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
      "preferred_domain",
      "status",
      "payment_status",
      "payment_id",
      "payment_order_id",
      "cashfree_order_id",
      "payment_amount",
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
    a.download = "apex-registrations.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="glass-panel grid gap-3 rounded-xl p-4 sm:p-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))_auto] items-center">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="SEARCH TEAM, LEADER, EMAIL, COLLEGE"
          aria-label="Search registrations"
          className="font-mono text-xs tracking-[0.12em] h-10 w-full col-span-1 sm:col-span-2 lg:col-span-1"
        />
        <Select value={teamSizeFilter} onValueChange={setTeamSizeFilter}>
          <SelectTrigger className="w-full h-10" aria-label="Filter by team size">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ALL SIZES</SelectItem>
            <SelectItem value="2">2 MEMBERS</SelectItem>
            <SelectItem value="3">3 MEMBERS</SelectItem>
            <SelectItem value="4">4 MEMBERS</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full h-10" aria-label="Filter by status">
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
        <Select value={paymentStatus} onValueChange={setPaymentStatus}>
          <SelectTrigger className="w-full h-10" aria-label="Filter by payment">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ALL PAYMENTS</SelectItem>
            <SelectItem value="paid">PAID</SelectItem>
            <SelectItem value="pending">PENDING</SelectItem>
            <SelectItem value="failed">FAILED</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={exportCsv}
          variant="outline"
          className="bg-transparent font-mono text-xs tracking-[0.16em] w-full sm:w-auto h-10 col-span-1 sm:col-span-2 lg:col-span-1"
        >
          <Download className="mr-2 h-4 w-4" /> EXPORT CSV
        </Button>
      </div>

      <div className="glass-panel overflow-x-auto rounded-xl p-3 sm:p-5">
        <table className="w-full min-w-[850px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border/70">
              {[
                "TEAM ID",
                "TEAM",
                "LEADER",
                "EMAIL",
                "COLLEGE",
                "MEMBERS",
                "DOMAIN",
                "STATUS",
                "PAYMENT",
                "PAYMENT ID",
                "PPT",
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
                  <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                    {t.preferred_domain || "Open"}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusChip status={t.status} />
                  </td>
                  <td className="py-3 pr-4">
                    <StatusChip status={t.payment_status as any || "pending"} />
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                    {t.payment_id || "-"}
                  </td>
                  <td className="py-3 pr-4">
                    {t.ppt_storage_path ? (
                      <button
                        type="button"
                        title={t.ppt_file_name || "Download PPT"}
                        aria-label={`Download PPT for ${t.team_name}`}
                        className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-card/40 px-2 py-1 font-mono text-xs text-muted-foreground transition hover:border-primary/50 hover:text-primary"
                        onClick={async () => {
                          try {
                            const result = await getAdminPptSignedUrl(t.id);
                            if (result?.signedUrl) {
                              window.open(result.signedUrl, "_blank", "noopener,noreferrer");
                            } else {
                              toast.error("Could not generate download link");
                            }
                          } catch {
                            toast.error("Failed to get download link");
                          }
                        }}
                      >
                        <ExternalLink className="h-3 w-3" />
                        {t.ppt_file_name?.split(".").pop()?.toUpperCase() ?? "PPT"}
                      </button>
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground/40">—</span>
                    )}
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
                        <Check className="h-3.5 w-3.5 text-accent-3" />
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
                  ["preferred_domain", "DOMAIN"],
                ] as const
              ).map(([k, label]) => (
                <div key={k}>
                  <Label htmlFor={k} className="system-label">
                    {label}
                  </Label>
                  <Input
                    id={k}
                    className="mt-1.5"
                    value={editing[k] ?? ""}
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
