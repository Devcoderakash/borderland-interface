import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarPlus, Download, QrCode } from "lucide-react";
import { z } from "zod";

import { SystemLabel } from "@/components/site/bits";
import { Button } from "@/components/ui/button";
import { suitBySymbol, type SuitKey } from "@/lib/borderland";

const searchSchema = z.object({
  pid: z.string().catch("BL-2048"),
  team: z.string().catch("TEAM NOVA"),
  suit: z.enum(["spades", "diamonds", "clubs", "hearts"]).catch("diamonds"),
});

export const Route = createFileRoute("/success")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Access Granted — BORDER//LAND" },
      {
        name: "description",
        content: "Your BORDER//LAND registration is confirmed. Collect your player ID and entry pass.",
      },
      { property: "og:title", content: "Access Granted — BORDER//LAND" },
      { property: "og:description", content: "Registration complete. Welcome to Border//Land." },
      { property: "og:url", content: "/success" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/success" }],
  }),
  component: SuccessPage,
});

const suitColor: Record<SuitKey, string> = {
  spades: "text-spade",
  diamonds: "text-diamond",
  clubs: "text-club",
  hearts: "text-heart",
};

function SuccessPage() {
  const { pid, team, suit } = Route.useSearch();

  const downloadPass = () => {
    const pass = [
      "BORDER//LAND — ENTRY PASS",
      "==========================",
      `PLAYER ID : ${pid}`,
      `TEAM      : ${team.toUpperCase()}`,
      `SUIT      : ${suitBySymbol[suit]} ${suit.toUpperCase()}`,
      "STATUS    : REGISTERED",
      "VENUE     : BORDER//LAND HQ, BHOPAL, MADHYA PRADESH",
      "DATE      : 14-15 MARCH 2026",
      "",
      "BUILD. THINK. ADAPT. SURVIVE.",
    ].join("\n");
    const url = URL.createObjectURL(new Blob([pass], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `borderland-pass-${pid}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addToCalendar = () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      "SUMMARY:BORDER//LAND Hackathon",
      "DTSTART:20260314T043000Z",
      "DTEND:20260315T103000Z",
      "LOCATION:Border//Land HQ, Bhopal, Madhya Pradesh",
      `DESCRIPTION:Player ID ${pid} — ${team}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "borderland.ics";
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
          <SystemLabel className="text-club">SYSTEM MESSAGE</SystemLabel>
          <h1 className="text-glow mt-3 font-display text-4xl font-black uppercase sm:text-5xl">
            Access granted
          </h1>
          <p className="mt-3 text-muted-foreground">
            Registration complete. Welcome to Border//Land.
          </p>

          <dl className="mt-9 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="system-label">PLAYER ID</dt>
              <dd className="mt-1 font-display text-2xl font-black text-primary">{pid}</dd>
            </div>
            <div>
              <dt className="system-label">TEAM</dt>
              <dd className="mt-1 font-display text-2xl font-black uppercase">{team}</dd>
            </div>
            <div>
              <dt className="system-label">SUIT</dt>
              <dd className={`mt-1 font-display text-2xl font-black uppercase ${suitColor[suit]}`}>
                {suitBySymbol[suit]} {suit}
              </dd>
            </div>
            <div>
              <dt className="system-label">STATUS</dt>
              <dd className="mt-1 font-display text-2xl font-black uppercase text-club">
                REGISTERED
              </dd>
            </div>
          </dl>

          <div className="mt-9 flex items-center gap-5 rounded-lg border border-border bg-background/40 p-5">
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded border border-border bg-card">
              <QrCode className="h-12 w-12 text-muted-foreground" aria-hidden />
            </div>
            <p className="text-sm text-muted-foreground">
              Present this code at the entry desk. Your skills brought you here — your decisions
              keep you here.
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
                <ArrowLeft className="mr-2 h-4 w-4" /> BACK TO BORDERLAND
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
