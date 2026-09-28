import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarPlus, Download, QrCode } from "lucide-react";
import { z } from "zod";

import { SystemLabel } from "@/components/site/bits";
import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";
import { getTeamByOrderId } from "@/lib/api";

const searchSchema = z.object({
  pid: z.string().optional().catch("APEX-2048"),
  team: z.string().optional().catch("TEAM NOVA"),
  order_id: z.string().optional(),
});

export const Route = createFileRoute("/success")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Access Granted — APEX 1.0" },
      {
        name: "description",
        content: "Your APEX 1.0 registration is confirmed. Collect your team ID and entry pass.",
      },
      { property: "og:title", content: "Access Granted — APEX 1.0" },
      { property: "og:description", content: "Registration complete. Welcome to APEX 1.0." },
      { property: "og:url", content: "/success" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/success" }],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const search = Route.useSearch();
  const [teamInfo, setTeamInfo] = useState<{ pid: string; team: string }>({
    pid: search.pid || "APEX-2048",
    team: search.team || "TEAM NOVA",
  });

  useEffect(() => {
    if (search.order_id) {
      getTeamByOrderId(search.order_id)
        .then((t) => {
          if (t && t.player_id && t.team_name) {
            setTeamInfo({ pid: t.player_id, team: t.team_name });
          }
        })
        .catch(() => {});
    } else if (search.pid && search.team) {
      setTeamInfo({ pid: search.pid, team: search.team });
    }
  }, [search.order_id, search.pid, search.team]);

  const pid = teamInfo.pid;
  const team = teamInfo.team;

  const downloadPass = () => {
    const pass = [
      "APEX 1.0 — ENTRY PASS",
      "==========================",
      `TEAM ID   : ${pid}`,
      `TEAM      : ${team.toUpperCase()}`,
      "STATUS    : REGISTERED",
      "VENUE     : APEX HQ, BHOPAL, MADHYA PRADESH",
      "DATE      : 14–15 MARCH 2026 (ROUND 2)",
      "",
      "BUILD. INNOVATE. PITCH. WIN.",
    ].join("\n");
    const url = URL.createObjectURL(new Blob([pass], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `apex-pass-${pid}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addToCalendar = () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      "SUMMARY:APEX 1.0 Hackathon",
      "DTSTART:20260314T043000Z",
      "DTEND:20260315T103000Z",
      "LOCATION:APEX HQ, Bhopal, Madhya Pradesh",
      `DESCRIPTION:Team ID ${pid} — ${team}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "apex-event.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="scanlines relative flex min-h-[100svh] items-center overflow-hidden void-bg px-5 py-28 sm:px-8">
      <div className="grid-veil pointer-events-none absolute inset-0" aria-hidden />
      <div className="grain pointer-events-none absolute inset-0" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto w-full max-w-2xl"
      >
        <div className="glass-panel rounded-2xl p-7 sm:p-10">
          <SystemLabel className="text-accent-3">SYSTEM MESSAGE</SystemLabel>
          <h1 className="text-glow mt-3 font-display text-4xl font-black uppercase sm:text-5xl">
            Access granted
          </h1>
          <p className="mt-3 text-muted-foreground">
            Registration complete. Welcome to APEX 1.0.
          </p>

          <dl className="mt-9 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="system-label">TEAM ID</dt>
              <dd className="mt-1 font-display text-2xl font-black text-primary">{pid}</dd>
            </div>
            <div>
              <dt className="system-label">TEAM</dt>
              <dd className="mt-1 font-display text-2xl font-black uppercase">{team}</dd>
            </div>
            <div>
              <dt className="system-label">STATUS</dt>
              <dd className="mt-1 font-display text-2xl font-black uppercase text-accent-3">
                CONFIRMED
              </dd>
            </div>
            <div>
              <dt className="system-label">PAYMENT</dt>
              <dd className="mt-1 font-display text-2xl font-black uppercase text-green-500">
                PAID (₹150)
              </dd>
            </div>
          </dl>

          <div className="mt-9 flex items-center gap-5 rounded-lg border border-border bg-background/40 p-5">
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded border border-border bg-card">
              <QrCode className="h-12 w-12 text-muted-foreground" aria-hidden />
            </div>
            <p className="text-sm text-muted-foreground">
              Present this verification at the entry desk during Round 2.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button onClick={downloadPass} className="glow-primary font-mono text-xs tracking-[0.18em]">
              <Download className="mr-2 h-4 w-4" /> DOWNLOAD ENTRY PASS
            </Button>
            <Button
              onClick={addToCalendar}
              variant="outline"
              className="bg-transparent font-mono text-xs tracking-[0.18em]"
            >
              <CalendarPlus className="mr-2 h-4 w-4" /> ADD TO CALENDAR
            </Button>
            <Button asChild variant="ghost" className="font-mono text-xs tracking-[0.18em]">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> BACK TO HOME
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
