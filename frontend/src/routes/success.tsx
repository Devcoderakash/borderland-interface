import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarPlus,
  Check,
  Copy,
  Download,
  QrCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { SystemLabel } from "@/components/site/bits";
import { Button } from "@/components/ui/button";
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
      { title: "Access Granted — APEX 1.0 Entry Pass" },
      {
        name: "description",
        content: "Your APEX 1.0 registration is confirmed. Collect your team ID and entry pass.",
      },
      { property: "og:title", content: "Access Granted — APEX 1.0 Entry Pass" },
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
  const [copiedId, setCopiedId] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);

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

  const handleCopyId = () => {
    navigator.clipboard.writeText(pid);
    setCopiedId(true);
    toast.success("Team ID copied to clipboard!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyOrder = () => {
    if (search.order_id) {
      navigator.clipboard.writeText(search.order_id);
      setCopiedOrder(true);
      toast.success("Order ID copied to clipboard!");
      setTimeout(() => setCopiedOrder(false), 2000);
    }
  };

  const downloadPass = () => {
    const pass = [
      "==================================================",
      "             APEX 1.0 — OFFICIAL ENTRY PASS        ",
      "              NATIONAL INNOVATION HACKATHON       ",
      "==================================================",
      "",
      `TEAM ID        : ${pid}`,
      `TEAM NAME      : ${team}`,
      `STATUS         : CONFIRMED (PAID ₹199)`,
      `ORDER ID       : ${search.order_id || "N/A"}`,
      `ROUND 1        : PPT IDEA SUBMISSION COMPLETED`,
      `ROUND 2 VENUE  : TECH CONVENTION CENTRE, BHOPAL`,
      `SECURITY HASH  : SEC-APEX-${Buffer.from(pid + team).toString("base64").slice(0, 16)}`,
      "",
      "--------------------------------------------------",
      "IMPORTANT INSTRUCTIONS:",
      "1. Present this Team ID and digital pass at the entry desk during Round 2.",
      "2. Shortlisted finalists will be contacted directly via registered email.",
      "3. All members must carry their college ID cards for offline check-in.",
      "--------------------------------------------------",
      "",
      "ONE IDEA. NO LIMITS.",
      "==================================================",
    ].join("\n");

    const url = URL.createObjectURL(new Blob([pass], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `apex-pass-${pid}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Entry pass downloaded successfully!");
  };

  const addToCalendar = () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//APEX 1.0//Hackathon Entry//EN",
      "BEGIN:VEVENT",
      "SUMMARY:APEX 1.0 National Hackathon — Grand Finale",
      "DTSTART:20260314T043000Z",
      "DTEND:20260315T123000Z",
      "LOCATION:Tech Convention Centre, Bhopal, Madhya Pradesh",
      `DESCRIPTION:APEX 1.0 Entry Pass for Team ${team} (ID: ${pid}). Bring your confirmation pass for offline verification.`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `apex-calendar-${pid}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Calendar invite downloaded!");
  };

  return (
    <section className="scanlines relative flex min-h-[100svh] items-center justify-center overflow-hidden void-bg px-4 py-24 sm:px-8 sm:py-28">
      <div className="grid-veil pointer-events-none absolute inset-0" aria-hidden />
      <div className="grain pointer-events-none absolute inset-0" aria-hidden />

      {/* Cyber ambient glow effects */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[36rem] rounded-full bg-primary/20 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-40 right-1/4 h-80 w-80 rounded-full bg-emerald-500/10 blur-[100px]"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto w-full max-w-3xl"
      >
        {/* Pass Container with futuristic ticket borders */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/40 bg-card/75 p-4 sm:p-7 md:p-10 backdrop-blur-xl shadow-[0_0_50px_-10px_rgba(225,29,72,0.25)]">
          {/* Top Status Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4 sm:pb-5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <SystemLabel className="text-emerald-400 font-bold tracking-[0.16em] sm:tracking-[0.2em] text-[0.65rem] sm:text-xs">
                ACCESS GRANTED // OFFICIAL PASS
              </SystemLabel>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 sm:px-3 py-1 font-mono text-[0.6rem] sm:text-[0.65rem] tracking-[0.14em] sm:tracking-[0.16em] text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              VERIFIED REGISTRATION
            </div>
          </div>

          {/* Heading */}
          <div className="mt-5 sm:mt-6">
            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white break-words">
              WELCOME TO <span className="text-primary text-glow">APEX 1.0</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
              Your registration and payment have been verified. Save your Team ID and entry pass below for Round 2 access.
            </p>
          </div>

          {/* Key Registration Details Grid */}
          <div className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            {/* Team ID Card */}
            <div className="group relative overflow-hidden rounded-xl border border-primary/40 bg-primary/5 p-4 sm:p-5 transition-all hover:border-primary/70 hover:bg-primary/10">
              <div className="flex items-center justify-between">
                <dt className="system-label text-primary font-bold">TEAM IDENTIFIER</dt>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="inline-flex items-center gap-1 rounded bg-background/60 px-2.5 py-1.5 font-mono text-[0.65rem] text-muted-foreground hover:text-white transition-colors min-h-[32px]"
                  title="Copy Team ID"
                >
                  {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedId ? "COPIED" : "COPY"}
                </button>
              </div>
              <dd className="mt-2 font-display text-xl sm:text-2xl md:text-3xl font-black tracking-wider text-primary break-all">
                {pid}
              </dd>
              <p className="mt-1 font-mono text-[0.6rem] sm:text-[0.65rem] text-white/50 tracking-wider">
                Quote this ID for all official communications.
              </p>
            </div>

            {/* Team Name Card */}
            <div className="relative overflow-hidden rounded-xl border border-border/70 bg-card/60 p-4 sm:p-5">
              <dt className="system-label text-muted-foreground">TEAM NAME</dt>
              <dd className="mt-2 font-display text-base sm:text-xl md:text-2xl font-bold tracking-wide text-foreground break-words line-clamp-2">
                {team}
              </dd>
              <p className="mt-1 font-mono text-[0.6rem] sm:text-[0.65rem] text-muted-foreground tracking-wider">
                Category: Open Innovation
              </p>
            </div>

            {/* Status Card */}
            <div className="relative overflow-hidden rounded-xl border border-border/70 bg-card/60 p-4 sm:p-5">
              <dt className="system-label text-muted-foreground">STATUS</dt>
              <dd className="mt-2 flex items-center gap-2 font-display text-lg sm:text-xl md:text-2xl font-bold text-cyan-400">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                ROUND 1 CONFIRMED
              </dd>
              <p className="mt-1 font-mono text-[0.6rem] sm:text-[0.65rem] text-muted-foreground tracking-wider">
                PPT submission queue assigned.
              </p>
            </div>

            {/* Payment Card */}
            <div className="relative overflow-hidden rounded-xl border border-border/70 bg-card/60 p-4 sm:p-5">
              <dt className="system-label text-muted-foreground">PAYMENT STATUS</dt>
              <dd className="mt-2 font-display text-lg sm:text-xl md:text-2xl font-bold text-emerald-400">
                PAID (₹199)
              </dd>
              <p className="mt-1 font-mono text-[0.6rem] sm:text-[0.65rem] text-muted-foreground tracking-wider">
                Razorpay Verified · Fee Cleared
              </p>
            </div>
          </div>

          {/* Order ID banner if present */}
          {search.order_id ? (
            <div className="mt-3.5 sm:mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 px-3.5 sm:px-4 py-2.5 sm:py-3">
              <div className="min-w-0 flex-1">
                <span className="font-mono text-[0.6rem] tracking-[0.16em] text-muted-foreground">
                  PAYMENT ORDER ID:
                </span>
                <p className="font-mono text-xs text-foreground/80 truncate break-all">{search.order_id}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyOrder}
                className="h-8 px-2.5 font-mono text-[0.65rem] text-muted-foreground hover:text-white shrink-0 min-h-[36px]"
              >
                {copiedOrder ? <Check className="mr-1 h-3.5 w-3.5 text-emerald-400" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
                {copiedOrder ? "COPIED" : "COPY"}
              </Button>
            </div>
          ) : null}

          {/* Cyber Entry Verification Ticket Preview */}
          <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-5 rounded-xl border border-dashed border-border/80 bg-background/50 p-4 sm:p-6">
            <div className="relative grid h-20 w-20 sm:h-24 sm:w-24 shrink-0 place-items-center rounded-lg border border-primary/30 bg-card p-2 shadow-inner group">
              <QrCode className="h-12 w-12 sm:h-16 sm:w-16 text-primary/80 transition-transform group-hover:scale-105" aria-hidden />
              <div className="absolute inset-x-1 bottom-1 text-center font-mono text-[0.45rem] sm:text-[0.5rem] tracking-wider text-muted-foreground">
                APEX PASS
              </div>
            </div>
            <div className="min-w-0 text-center sm:text-left">
              <p className="font-display text-xs sm:text-sm font-bold tracking-wider text-foreground">
                OFFLINE ROUND 2 ENTRY DESK CHECK-IN
              </p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Shortlisted teams will present this digital verification along with valid student IDs at the Tech Convention Centre, Bhopal.
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1 font-mono text-[0.65rem] text-primary">
                  <Sparkles className="h-3 w-3" /> ONE IDEA. NO LIMITS.
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={downloadPass}
              className="h-11 sm:h-12 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary font-mono text-xs tracking-[0.16em] sm:tracking-[0.18em] transition-all w-full sm:w-auto min-h-[44px]"
            >
              <Download className="mr-2 h-4 w-4" /> DOWNLOAD ENTRY PASS
            </Button>
            <Button
              onClick={addToCalendar}
              variant="outline"
              className="h-11 sm:h-12 border-border bg-background/50 hover:bg-secondary/60 font-mono text-xs tracking-[0.16em] sm:tracking-[0.18em] text-white w-full sm:w-auto min-h-[44px]"
            >
              <CalendarPlus className="mr-2 h-4 w-4" /> ADD TO CALENDAR
            </Button>
            <Button
              asChild
              variant="ghost"
              className="h-11 sm:h-12 font-mono text-xs tracking-[0.16em] sm:tracking-[0.18em] text-muted-foreground hover:text-white w-full sm:w-auto min-h-[44px]"
            >
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

