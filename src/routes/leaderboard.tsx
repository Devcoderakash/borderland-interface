import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Reveal, Section, StatusChip, SystemLabel } from "@/components/site/bits";
import { PageHeader } from "@/components/site/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { SUITS, suitBySymbol, type SuitKey } from "@/lib/borderland";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  rank: number;
  team_name: string;
  suit: SuitKey;
  score: number;
  status: string;
};

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Survivors — BORDER//LAND Leaderboard" },
      {
        name: "description",
        content:
          "Live standings from the BORDER//LAND hackathon: ranks, suits, scores and survival status for every team still in the game.",
      },
      { property: "og:title", content: "Survivors — BORDER//LAND Leaderboard" },
      { property: "og:description", content: "Who is still in the game." },
      { property: "og:url", content: "/leaderboard" },
    ],
    links: [{ rel: "canonical", href: "/leaderboard" }],
  }),
  component: LeaderboardPage,
});

const suitColor: Record<SuitKey, string> = {
  spades: "text-spade",
  diamonds: "text-diamond",
  clubs: "text-club",
  hearts: "text-heart",
};

function LeaderboardPage() {
  const [q, setQ] = useState("");
  const [suit, setSuit] = useState<SuitKey | "all">("all");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase
        .from("leaderboard")
        .select("id, rank, team_name, suit, score, status")
        .order("rank", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const rows = (data ?? []).filter(
    (r) =>
      (suit === "all" || r.suit === suit) &&
      r.team_name.toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <>
      <PageHeader
        code="SYSTEM_11 / STANDINGS"
        title="Survivors"
        subtitle="Live standings. Scores update as each game closes."
      />

      <Section>
        <Reveal>
          <div className="glass-panel rounded-xl p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="SEARCH TEAM"
                aria-label="Search team"
                className="font-mono text-xs tracking-[0.14em]"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={suit === "all" ? "default" : "outline"}
                  onClick={() => setSuit("all")}
                  className="bg-transparent font-mono text-[0.65rem] tracking-[0.16em] data-[active=true]:bg-primary"
                  data-active={suit === "all"}
                >
                  ALL
                </Button>
                {SUITS.map((s) => (
                  <Button
                    key={s.key}
                    size="sm"
                    variant={suit === s.key ? "default" : "outline"}
                    onClick={() => setSuit(s.key)}
                    className={cn("font-mono text-[0.65rem] tracking-[0.16em]", suit !== s.key && "bg-transparent")}
                  >
                    {s.symbol} {s.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border/70">
                    {["RANK", "TEAM", "SUIT", "SCORE", "STATUS"].map((h) => (
                      <th key={h} className="pb-3 pr-4">
                        <SystemLabel>{h}</SystemLabel>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i} className="border-b border-border/40">
                          <td colSpan={5} className="py-3.5">
                            <Skeleton className="h-5 w-full" />
                          </td>
                        </tr>
                      ))
                    : rows.map((r) => (
                        <tr
                          key={r.id}
                          className="border-b border-border/40 transition-colors hover:bg-secondary/40"
                        >
                          <td className="py-3.5 pr-4 font-display text-sm font-black text-primary">
                            {String(r.rank).padStart(2, "0")}
                          </td>
                          <td className="py-3.5 pr-4 font-display text-sm font-bold tracking-[0.1em]">
                            {r.team_name}
                          </td>
                          <td className={cn("py-3.5 pr-4 text-lg", suitColor[r.suit])}>
                            {suitBySymbol[r.suit]}
                          </td>
                          <td className="py-3.5 pr-4 font-mono text-sm">{r.score}</td>
                          <td className="py-3.5 pr-4">
                            <StatusChip status={r.status} />
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>

              {!isLoading && rows.length === 0 ? (
                <p className="py-10 text-center system-label">
                  {isError ? "SIGNAL LOST — STANDINGS UNAVAILABLE" : "NO TEAMS MATCH THIS FILTER"}
                </p>
              ) : null}
            </div>

            <p className="mt-5 system-label">
              ROUND: 03 · PLAYER_COUNT: {(data ?? []).length * 3} · SIGNAL: STABLE
            </p>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
