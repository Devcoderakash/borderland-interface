import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/admin-shell";
import { SystemLabel } from "@/components/site/bits";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { SUITS, type SuitKey } from "@/lib/borderland";

type Entry = {
  id: string;
  rank: number;
  team_name: string;
  suit: SuitKey;
  score: number;
  status: string;
  published: boolean;
};

const STATUSES = ["SURVIVED", "AT RISK", "ELIMINATED"];

export const Route = createFileRoute("/admin/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard Control — BORDER//LAND Admin" },
      { name: "description", content: "Manage ranks, scores and survival status for BORDER//LAND teams." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Leaderboard Control — BORDER//LAND Admin" },
      { property: "og:description", content: "Standings management." },
    ],
  }),
  component: () => (
    <AdminShell title="Leaderboard control">
      <LeaderboardAdmin />
    </AdminShell>
  ),
});

function LeaderboardAdmin() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState({ team_name: "", suit: "spades", score: "0", rank: "1" });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "leaderboard"],
    queryFn: async (): Promise<Entry[]> => {
      const { data, error } = await supabase
        .from("leaderboard")
        .select("*")
        .order("rank", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Entry[];
    },
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin", "leaderboard"] });
    void qc.invalidateQueries({ queryKey: ["leaderboard"] });
  };

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("leaderboard").insert({
        team_name: draft.team_name.trim(),
        suit: draft.suit as SuitKey,
        score: Number(draft.score) || 0,
        rank: Number(draft.rank) || 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("TEAM ADDED TO STANDINGS");
      setDraft({ team_name: "", suit: "spades", score: "0", rank: "1" });
      invalidate();
    },
    onError: (e: Error) => toast.error("ADD FAILED", { description: e.message }),
  });

  const update = useMutation({
    mutationFn: async (entry: Entry) => {
      const { error } = await supabase
        .from("leaderboard")
        .update({
          rank: entry.rank,
          team_name: entry.team_name,
          suit: entry.suit,
          score: entry.score,
          status: entry.status,
          published: entry.published,
        })
        .eq("id", entry.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("STANDINGS UPDATED");
      invalidate();
    },
    onError: (e: Error) => toast.error("UPDATE FAILED", { description: e.message }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leaderboard").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("ENTRY REMOVED");
      invalidate();
    },
    onError: (e: Error) => toast.error("DELETE FAILED", { description: e.message }),
  });

  const publishAll = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("leaderboard")
        .update({ published: true })
        .neq("published", true);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("LEADERBOARD PUBLISHED");
      invalidate();
    },
    onError: (e: Error) => toast.error("PUBLISH FAILED", { description: e.message }),
  });

  const [rows, setRows] = useState<Entry[] | null>(null);
  const list = rows ?? data ?? [];
  const patch = (id: string, patchValues: Partial<Entry>) =>
    setRows((current) =>
      (current ?? data ?? []).map((r) => (r.id === id ? { ...r, ...patchValues } : r)),
    );

  return (
    <div className="space-y-5">
      <div className="glass-panel rounded-xl p-5">
        <SystemLabel>ADD TEAM</SystemLabel>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.team_name.trim().length < 2) {
              toast.error("TEAM NAME REQUIRED");
              return;
            }
            add.mutate();
          }}
        >
          <div>
            <Label htmlFor="team" className="system-label">
              TEAM
            </Label>
            <Input
              id="team"
              className="mt-1.5"
              value={draft.team_name}
              onChange={(e) => setDraft({ ...draft, team_name: e.target.value })}
            />
          </div>
          <div>
            <Label className="system-label">SUIT</Label>
            <Select value={draft.suit} onValueChange={(v) => setDraft({ ...draft, suit: v })}>
              <SelectTrigger className="mt-1.5 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUITS.map((s) => (
                  <SelectItem key={s.key} value={s.key}>
                    {s.symbol} {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="rank" className="system-label">
              RANK
            </Label>
            <Input
              id="rank"
              type="number"
              min={1}
              className="mt-1.5 w-20"
              value={draft.rank}
              onChange={(e) => setDraft({ ...draft, rank: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="score" className="system-label">
              SCORE
            </Label>
            <Input
              id="score"
              type="number"
              className="mt-1.5 w-24"
              value={draft.score}
              onChange={(e) => setDraft({ ...draft, score: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={add.isPending} className="font-mono text-xs tracking-[0.16em]">
            <Plus className="mr-2 h-4 w-4" /> ADD
          </Button>
        </form>
      </div>

      <div className="glass-panel overflow-x-auto rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SystemLabel>STANDINGS</SystemLabel>
          <Button
            onClick={() => publishAll.mutate()}
            disabled={publishAll.isPending}
            className="font-mono text-xs tracking-[0.16em]"
          >
            PUBLISH LEADERBOARD
          </Button>
        </div>

        {isLoading ? (
          <Skeleton className="mt-5 h-40 w-full" />
        ) : (
          <table className="mt-5 w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border/70">
                {["RANK", "TEAM", "SUIT", "SCORE", "STATUS", "PUBLISHED", "ACTIONS"].map((h) => (
                  <th key={h} className="pb-3 pr-4">
                    <SystemLabel>{h}</SystemLabel>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className="border-b border-border/40">
                  <td className="py-2.5 pr-4">
                    <Input
                      type="number"
                      min={1}
                      aria-label={`Rank for ${r.team_name}`}
                      value={r.rank}
                      onChange={(e) => patch(r.id, { rank: Number(e.target.value) })}
                      className="w-20"
                    />
                  </td>
                  <td className="py-2.5 pr-4">
                    <Input
                      aria-label={`Name for ${r.team_name}`}
                      value={r.team_name}
                      onChange={(e) => patch(r.id, { team_name: e.target.value })}
                      className="min-w-40"
                    />
                  </td>
                  <td className="py-2.5 pr-4">
                    <Select
                      value={r.suit}
                      onValueChange={(v) => patch(r.id, { suit: v as SuitKey })}
                    >
                      <SelectTrigger className="w-32" aria-label={`Suit for ${r.team_name}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUITS.map((s) => (
                          <SelectItem key={s.key} value={s.key}>
                            {s.symbol} {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-2.5 pr-4">
                    <Input
                      type="number"
                      aria-label={`Score for ${r.team_name}`}
                      value={r.score}
                      onChange={(e) => patch(r.id, { score: Number(e.target.value) })}
                      className="w-24"
                    />
                  </td>
                  <td className="py-2.5 pr-4">
                    <Select value={r.status} onValueChange={(v) => patch(r.id, { status: v })}>
                      <SelectTrigger className="w-36" aria-label={`Status for ${r.team_name}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-2.5 pr-4">
                    <Switch
                      checked={r.published}
                      aria-label={`Published for ${r.team_name}`}
                      onCheckedChange={(v) => patch(r.id, { published: v })}
                    />
                  </td>
                  <td className="py-2.5 pr-4">
                    <div className="flex gap-1.5">
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Save entry"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => update.mutate(r)}
                      >
                        <Save className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Delete entry"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => {
                          if (confirm(`Remove ${r.team_name}?`)) remove.mutate(r.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-primary" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && list.length === 0 ? (
          <p className="py-10 text-center system-label">NO STANDINGS YET</p>
        ) : null}
      </div>
    </div>
  );
}
