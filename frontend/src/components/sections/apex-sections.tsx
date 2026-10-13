import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Terminal, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Counter,
  Reveal,
  Section,
  SectionHeading,
  SystemLabel,
} from "@/components/site/bits";
import {
  EVALUATION_CRITERIA,
  FAQS,
  ROADMAP,
  ORGANIZERS,
  PRIZES,
  RULES,
  SPECIAL_AWARDS,
} from "@/lib/apex";
import { cn } from "@/lib/utils";
import { CinematicHeroBackground } from "./cinematic-hero-background";

/* ------------------------------- HERO ------------------------------- */

function useCountdown(targetIso: string) {
  const [left, setLeft] = useState("--:--:--");
  useEffect(() => {
    const target = new Date(targetIso).getTime();
    const tick = () => {
      const diff = Math.max(target - Date.now(), 0);
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setLeft(
        [h, m, s].map((n) => n.toString().padStart(2, "0")).join(":"),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);
  return left;
}

export function Hero() {
  const remaining = useCountdown(
    new Date(Date.now() + 4 * 3600_000 + 32 * 60_000).toISOString(),
  );

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-between overflow-x-clip bg-background px-4 pt-20 pb-4 sm:px-8 sm:pt-28 md:pb-12 lg:min-h-screen lg:justify-center lg:pb-24">
      {/* Cinematic Animated Background */}
      <CinematicHeroBackground />

      <div className="relative z-10 mx-auto w-full max-w-7xl my-auto py-2.5 sm:py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            className="reveal-safe flex flex-col justify-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/50 bg-primary/10 px-2.5 py-0.5 sm:px-3 sm:py-1 w-fit shadow-[0_0_12px_rgba(225,29,72,0.3)] backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" aria-hidden />
              <SystemLabel className="text-primary text-[0.6rem] sm:text-[0.65rem] tracking-[0.16em] sm:tracking-[0.2em] font-bold">REGISTRATIONS OPEN</SystemLabel>
            </div>

            <h1 className="mt-3.5 sm:mt-8 font-display text-[2.2rem] xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.98] sm:leading-[0.95] tracking-tight text-white break-words">
              APEX<span className="text-primary text-glow">//</span>1.0
            </h1>

            <div className="mt-2.5 sm:mt-5 flex flex-col font-display font-black uppercase tracking-tight">
              <span className="text-xl xs:text-2xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.08] sm:leading-[1.05] text-transparent bg-clip-text bg-gradient-to-b from-white via-white/95 to-white/70">
                ONE IDEA.
              </span>
              <span className="text-xl xs:text-2xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.08] sm:leading-[1.05] text-primary text-glow">
                NO LIMITS.
              </span>
            </div>

            <p className="mt-3 sm:mt-6 max-w-lg text-[0.875rem] sm:text-base md:text-lg text-white/75 leading-relaxed font-normal">
              A premier open-innovation hackathon where students build, innovate, pitch, and compete to create impactful solutions.
            </p>

            <div className="mt-4.5 sm:mt-8 flex flex-col gap-2.5 sm:flex-row sm:gap-4 w-full sm:w-auto">
              <Button asChild size="lg" className="group h-11 sm:h-13 px-5 sm:px-8 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary font-mono text-xs tracking-[0.16em] sm:tracking-[0.2em] rounded-md transition-all duration-200 w-full sm:w-auto min-h-[44px]">
                <Link to="/register">
                  ENTER THE HACKATHON <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="group h-11 sm:h-13 px-5 sm:px-8 border-border/80 bg-background/50 hover:bg-primary/10 hover:border-primary/50 font-mono text-xs tracking-[0.16em] sm:tracking-[0.2em] rounded-md transition-all duration-200 text-white/90 hover:text-white w-full sm:w-auto min-h-[44px]"
              >
                <a href="#roadmap">
                  EXPLORE THE ROADMAP <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
                </a>
              </Button>
            </div>

            <div className="mt-3.5 sm:mt-7 border-l-2 border-primary/50 pl-3 sm:pl-4 py-0.5 sm:py-1">
              <p className="font-serif italic text-white/60 text-xs sm:text-base tracking-wide">
                “Ideas don’t wait. Neither should you.”
              </p>
              <p className="mt-0.5 font-mono text-[0.6rem] sm:text-[0.65rem] tracking-[0.18em] text-white/35 uppercase">
                — APEX 1.0
              </p>
            </div>

            <div className="mt-4 sm:mt-10 lg:mt-16">
              <p className="font-display font-black text-sm sm:text-xl tracking-widest text-white/90">
                ▲ APEX<span className="text-primary">//</span>1.0
              </p>
              <p className="mt-0.5 font-mono text-[0.65rem] sm:text-xs tracking-[0.18em] text-white/50 uppercase leading-relaxed">
                BIGGER IDEAS.<br />
                BRIGHTER PEOPLE.
              </p>
            </div>
          </motion.div>

          {/* Right Side Micro Message & HUD Telemetry */}
          <motion.div
            className="hidden lg:flex flex-col items-end justify-between h-full pt-10"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="text-right">
              <p className="font-mono text-xs tracking-[0.3em] text-white/40 uppercase leading-loose border-b border-primary/40 pb-2">
                BUILD<br />
                SOLVE<br />
                INNOVATE<br />
                <span className="text-white/80">TOGETHER.</span>
              </p>

              {/* Sleek Mini Telemetry HUD Card */}
              <div className="mt-6 glass-panel rounded-lg p-3.5 border-border/60 bg-card/40 backdrop-blur-md text-left w-64 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.8)]">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-[0.6rem] tracking-[0.18em] text-white/80">SYSTEM READY</span>
                  </div>
                  <span className="font-mono text-[0.55rem] tracking-[0.16em] text-primary">SYS//2026</span>
                </div>
                <div className="mt-2.5 space-y-1.5 font-mono text-[0.6rem] tracking-wider text-white/60">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MODE:</span>
                    <span className="text-white font-semibold">OPEN INNOVATION</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ROUND 1:</span>
                    <span className="text-primary font-semibold">ONLINE SUBMISSION</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ROUND 2:</span>
                    <span className="text-white font-semibold">OFFLINE GRAND FINALE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Tag */}
            <div className="mt-auto pb-8">
              <p className="font-mono text-xs tracking-[0.2em] text-white/50 hover:text-primary transition-colors cursor-pointer">
                #APEX1.0
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Information Bar - Fully accessible responsive grid */}
      <div className="relative z-20 mt-4 sm:mt-6 w-full border-t border-white/[0.08] bg-background/90 backdrop-blur-md lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:mt-0 lg:bg-background/70 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.5)]">
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-8 sm:py-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 lg:flex lg:w-full lg:items-center lg:justify-between lg:gap-4 xl:gap-6">
            {[
              ["TEAM SIZE", "1–4 MEMBERS"],
              ["FORMAT", "OPEN INNOVATION"],
              ["STRUCTURE", "2 ROUNDS"],
              ["PRIZE POOL", "₹30,000"],
              ["ROUND 1", "ONLINE"],
              ["ROUND 2", "OFFLINE"],
              ["LOCATION", "BHOPAL"],
            ].map(([k, v], i) => (
              <div
                key={k}
                className={cn(
                  "group flex flex-col justify-center rounded-lg border border-border/40 bg-card/30 p-2 sm:p-2.5 lg:border-0 lg:bg-transparent lg:p-0 min-w-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40",
                  i === 6 ? "col-span-2 sm:col-span-1" : ""
                )}
              >
                <div className="flex items-center min-w-0">
                  {i > 0 && <div className="hidden h-8 w-px bg-border/40 mr-6 lg:block" aria-hidden />}
                  <div className="min-w-0 flex-1">
                    <dt className="font-mono text-[0.55rem] sm:text-[0.6rem] tracking-[0.16em] text-muted-foreground truncate uppercase group-hover:text-foreground/70 transition-colors">
                      {k}
                    </dt>
                    <dd className="mt-0.5 font-display text-xs sm:text-sm font-bold tracking-wider text-foreground whitespace-normal break-words group-hover:text-primary transition-colors">
                      {v}
                    </dd>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-[4.5rem] left-1/2 -translate-x-1/2 z-20 hidden lg:flex flex-col items-center">
        <p className="font-mono text-[0.65rem] tracking-[0.2em] text-white/40 mb-2">SCROLL TO EXPLORE</p>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowRight className="h-4 w-4 text-white/40 rotate-90" />
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------ WELCOME ------------------------------ */

export function WelcomeSection() {
  return (
    <Section id="welcome" className="grain">
      <div className="grid gap-8 md:gap-12 md:grid-cols-[1.15fr_1fr] md:items-center">
        <Reveal>
          <SectionHeading code="SYSTEM 01 / ABOUT APEX" title="About APEX 1.0" />
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>You have entered APEX 1.0 — a premier open-innovation hackathon for student builders and problem solvers.</p>
            <p>APEX 1.0 brings together student innovators across domains to design, prototype, and pitch impactful solutions for real-world challenges.</p>
            <p className="text-foreground">The journey is split into two distinct rounds:</p>
            <ul className="space-y-2 font-mono text-sm">
              {[
                "Round 1: Idea Submission & PPT Pitch (Online)",
                "Round 2: Grand Finale Build & Demo (Offline, Bhopal)",
              ].map((q) => (
                <li key={q} className="flex gap-3">
                  <span className="text-primary">›</span>
                  {q}
                </li>
              ))}
            </ul>
            <p className="font-display uppercase tracking-widest text-foreground">
              Bring your best ideas.
            </p>
          </div>
          <Button asChild variant="outline" className="group mt-6 sm:mt-8 border-border/80 bg-card/30 hover:border-primary/50 hover:bg-primary/10 font-mono text-xs tracking-[0.18em] w-full sm:w-auto min-h-[44px]">
            <Link to="/rules">
              EXPLORE EVENT RULES <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </Button>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass-panel scanlines relative grid aspect-square max-h-72 place-items-center overflow-hidden rounded-xl sm:max-h-80 md:max-h-none">
            <div className="absolute inset-0 grid-veil" aria-hidden />
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                aria-hidden
                className="absolute rounded-full border border-primary/40"
                style={{
                  width: `${40 + i * 22}%`,
                  height: `${40 + i * 22}%`,
                  animation: `pulse-ring 3.4s ${i * 1.1}s ease-out infinite`,
                }}
              />
            ))}
            <div className="relative grid h-24 w-24 sm:h-28 sm:w-28 place-items-center rounded-xl border border-primary/50 bg-card text-center font-display glow-primary float-card p-4">
              <Terminal className="h-8 w-8 text-primary" />
              <div className="mt-1 font-display text-xs sm:text-sm font-black tracking-widest text-foreground">
                APEX<span className="text-primary">//</span>1.0
              </div>
            </div>
            {/* Corner micro-labels */}
            <span className="absolute left-4 top-4 font-mono text-[0.5rem] tracking-[0.2em] text-muted-foreground/40" aria-hidden>
              STATUS: ACTIVE
            </span>
            <span className="absolute right-4 top-4 font-mono text-[0.5rem] tracking-[0.2em] text-muted-foreground/40" aria-hidden>
              APX//01
            </span>
            <p className="absolute bottom-3 sm:bottom-5 system-label text-[0.5rem] sm:text-[0.6875rem] text-center px-2">PORTAL: ACTIVE · REGISTRATIONS: OPEN</p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ----------------------------- EVALUATION ----------------------------- */

export function JudgingSection() {
  return (
    <Section id="judging">
      <Reveal>
        <SectionHeading
          code="SYSTEM 02 / JUDGING CRITERIA"
          title="Judging Criteria"
          subtitle="Every project is evaluated across four core dimensions."
        />
      </Reveal>

      <div className="mt-10 grid gap-4 grid-cols-1 sm:grid-cols-2">
        {EVALUATION_CRITERIA.map((criterion, i) => (
          <Reveal key={criterion.id} delay={i * 0.07}>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "group glass-panel relative w-full overflow-hidden rounded-xl p-4 sm:p-6 md:p-8 text-left transition-all duration-300 hover:-translate-y-1 focus-visible:-translate-y-1",
                    criterion.borderClass,
                    "hover:shadow-[0_0_40px_-8px_currentColor]",
                    criterion.colorClass,
                  )}
                >
                  {/* Faint giant number background */}
                  <span
                    className="pointer-events-none absolute -right-3 -top-5 select-none font-display text-[6rem] sm:text-[8rem] md:text-[10rem] font-black leading-none text-foreground/[0.03]"
                    aria-hidden
                  >
                    {criterion.id}
                  </span>

                  <div className={cn("absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100", criterion.bgClass)} aria-hidden />

                  <div className="relative">
                    {/* Top: code label */}
                    <SystemLabel>{criterion.code}</SystemLabel>

                    {/* Title + weightage row */}
                    <div className="mt-3 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className={cn("font-display text-2xl font-black", criterion.colorClass)}>
                          {criterion.id}. {criterion.name}
                        </h3>
                        <p className="mt-1 font-display text-sm tracking-[0.22em] text-foreground">
                          {criterion.role}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 font-display text-3xl font-black tracking-tight transition-transform duration-300 group-hover:scale-105",
                          criterion.colorClass,
                        )}
                        aria-hidden
                      >
                        {criterion.weightage}
                      </span>
                    </div>

                    {/* Subtitle */}
                    <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
                      {criterion.focus}
                    </p>

                    {/* Description */}
                    <p className="mt-3 text-sm text-muted-foreground">{criterion.description}</p>

                    {/* Progress bar representing weightage */}
                    <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-border/40">
                      <motion.div
                        className={cn("h-full rounded-full", criterion.bgClass.replace("/10", "/60"))}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${criterion.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                      />
                    </div>

                    {/* Footer CTA */}
                    <p className="mt-5 font-mono text-[0.65rem] tracking-[0.2em] text-foreground/70">
                      PREPARE YOUR SUBMISSION →
                    </p>
                  </div>

                  {/* Decorative corner brackets on hover */}
                  <span className="pointer-events-none absolute left-3 top-3 font-mono text-[0.6rem] text-foreground/10 transition-colors duration-300 group-hover:text-foreground/30" aria-hidden>⌐</span>
                  <span className="pointer-events-none absolute right-3 bottom-3 font-mono text-[0.6rem] text-foreground/10 transition-colors duration-300 group-hover:text-foreground/30" aria-hidden>¬</span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className={cn("font-display text-2xl", criterion.colorClass)}>
                    {criterion.id}. {criterion.name} — {criterion.role} ({criterion.weightage})
                  </DialogTitle>
                  <DialogDescription className="font-mono text-[0.7rem] uppercase tracking-[0.16em]">
                    {criterion.focus}
                  </DialogDescription>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">{criterion.description}</p>
                <Button asChild className="mt-6 font-mono text-xs tracking-[0.18em]">
                  <Link to="/register">REGISTER YOUR TEAM</Link>
                </Button>
              </DialogContent>
            </Dialog>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------ ROADMAP ------------------------------ */

export function RoadmapSection() {
  return (
    <Section id="roadmap">
      <Reveal>
        <SectionHeading
          code="SYSTEM 03 / ROADMAP"
          title="The Roadmap"
          subtitle="Two rounds. Seven phases. One champion."
        />
      </Reveal>

      {/* ── Desktop: connected node diagram ── */}
      <div className="mt-14 hidden md:block">
        {/* Row 1: Phases 1-4 */}
        <RoadmapRow items={ROADMAP.slice(0, 4)} />
        {/* Vertical connector between rows */}
        <div className="ml-[calc(75%+0.5rem)] flex h-10 justify-center">
          <div className="w-px border-l border-dashed border-primary/30" />
        </div>
        {/* Row 2: Phases 5-7 */}
        <RoadmapRow items={ROADMAP.slice(4)} />
      </div>

      {/* ── Mobile: vertical list ── */}
      <ol className="mt-12 space-y-4 md:hidden">
        {ROADMAP.map((g, i) => (
          <Reveal key={g.id} delay={i * 0.06}>
            <li className={cn(
              "glass-panel relative overflow-hidden rounded-xl p-5 sm:p-7",
              g.active && "border-primary/50",
            )}>
              <span className="absolute left-0 top-0 h-full w-[3px] bg-primary/70" aria-hidden />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full border font-mono text-xs font-bold",
                    g.active
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border bg-card text-muted-foreground",
                  )}>
                    {g.n.toString().padStart(2, "0")}
                  </div>
                  <h3 className="font-display text-sm sm:text-base font-black uppercase truncate">
                    {g.title}
                  </h3>
                </div>
                <span className="inline-flex items-center rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[0.6rem] font-bold tracking-widest text-primary shrink-0 ml-auto sm:ml-0">
                  {g.window}
                </span>
              </div>
              <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">{g.text}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}

function RoadmapRow({ items }: { items: typeof ROADMAP }) {
  return (
    <div className="relative grid" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
      {/* Connecting line */}
      <div className="pointer-events-none absolute left-[1.25rem] right-[1.25rem] top-5 z-0">
        <div className="h-px w-full border-t border-dashed border-primary/30" />
        {/* Animated pulse along the line */}
        <motion.div
          className="absolute -top-px left-0 h-[3px] w-8 rounded-full bg-primary/60"
          animate={{ left: ["0%", "95%", "0%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
      </div>

      {items.map((g) => (
        <Reveal key={g.id} delay={g.n * 0.06}>
          <div className="relative flex flex-col items-center text-center px-2">
            {/* Node circle */}
            <div className={cn(
              "relative z-10 grid h-10 w-10 place-items-center rounded-full border-2 font-mono text-xs font-bold",
              g.active
                ? "border-primary bg-primary/20 text-primary shadow-[0_0_20px_-4px] shadow-primary"
                : "border-border bg-card text-muted-foreground",
            )}>
              {g.n.toString().padStart(2, "0")}
              {g.active && (
                <span className="absolute h-10 w-10 animate-ping rounded-full border border-primary/40" aria-hidden />
              )}
            </div>

            {/* Title */}
            <h3 className="mt-3 font-display text-xs font-black uppercase tracking-widest">
              {g.title}
            </h3>

            {/* Window badge */}
            <span className="mt-2 inline-flex items-center rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[0.55rem] font-bold tracking-widest text-primary">
              {g.window}
            </span>

            {/* Description */}
            <p className="mt-2 text-[0.7rem] leading-relaxed text-muted-foreground">
              {g.text}
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/* ------------------------------- RULES ------------------------------- */

export function RulesSection() {
  return (
    <Section id="rules">
      <Reveal>
        <SectionHeading
          code="SYSTEM 04 / RULES"
          title="The Rules"
          subtitle="Key guidelines governing APEX 1.0. Ensure compliance before submission."
        />
      </Reveal>
      <div className="mt-12 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {RULES.map((r) => (
          <Reveal key={r.n} delay={0.05}>
            <article className="glass-panel group relative h-full overflow-hidden rounded-xl p-5 sm:p-6 transition-all duration-300 hover:border-primary/40">
              {/* Faint background number */}
              <span
                className="pointer-events-none absolute -right-2 -top-4 select-none font-display text-[5rem] sm:text-[6rem] font-black leading-none text-foreground/[0.03]"
                aria-hidden
              >
                {r.n}
              </span>
              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-2xl sm:text-3xl font-black text-primary/70">{r.n}</p>
                  <span className="inline-flex items-center gap-1 rounded-full border border-accent-3/30 bg-accent-3/5 px-2 py-0.5 font-mono text-[0.5rem] tracking-[0.18em] text-accent-3/70">
                    <span className="h-1 w-1 rounded-full bg-accent-3/60" aria-hidden />
                    ACTIVE
                  </span>
                </div>
                <h3 className="mt-3 font-display text-sm sm:text-base font-bold tracking-[0.18em]">{r.title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">{r.text}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <Button asChild variant="outline" className="mt-6 sm:mt-8 bg-transparent font-mono text-xs tracking-[0.18em] w-full sm:w-auto min-h-[44px]">
          <Link to="/rules">
            READ COMPLETE GUIDELINES <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </Reveal>
    </Section>
  );
}

/* ------------------------------- PRIZES ------------------------------- */

export function PrizesSection() {
  return (
    <Section id="prizes">
      <Reveal>
        <SectionHeading
          code="SYSTEM 05 / PRIZES"
          title="Prizes"
          subtitle="₹30,000 total prize pool, plus six special awards."
        />
      </Reveal>

      {/* Grand champion – prominently featured */}
      <Reveal>
        <div className="mt-12 glass-panel relative overflow-hidden rounded-xl border-primary/60 glow-primary p-6 text-center sm:p-12 shadow-[0_20px_60px_-15px_rgba(225,29,72,0.25)]">
          <div className="hair-line absolute top-0 inset-x-0" />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.08] via-transparent to-transparent" aria-hidden />
          <span className="pointer-events-none absolute -right-10 -top-10 select-none font-display text-[8rem] sm:text-[12rem] font-black leading-none text-foreground/[0.02]" aria-hidden>01</span>

          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-primary/60 bg-primary/15 text-primary shadow-[0_0_24px_rgba(225,29,72,0.4)]">
            <Trophy className="h-5 w-5" />
          </div>

          <SystemLabel className="text-primary font-bold tracking-[0.25em]">FIRST PLACE</SystemLabel>
          <p className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white/95 to-white/70 drop-shadow-[0_0_25px_rgba(225,29,72,0.35)]">
            <Counter to={18000} prefix="₹" />
          </p>
          <h3 className="mt-3 font-display text-base sm:text-lg font-bold tracking-[0.2em] sm:tracking-[0.3em] text-primary">
            1ST PRIZE — GRAND CHAMPION
          </h3>
          <p className="mt-3 text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            The team demonstrating the highest combined score across all four judging criteria.
          </p>
        </div>
      </Reveal>

      {/* Runner up + Second runner up */}
      <div className="mt-5 grid gap-5 grid-cols-1 sm:grid-cols-2">
        {PRIZES.slice(1).map((p, i) => (
          <Reveal key={p.title} delay={(i + 1) * 0.08}>
            <article className="glass-panel group relative h-full overflow-hidden rounded-xl p-5 sm:p-7 text-center transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.8)]">
              <span className="pointer-events-none absolute -right-4 -top-4 select-none font-display text-[6rem] sm:text-[8rem] font-black leading-none text-foreground/[0.02]" aria-hidden>
                {String(i + 2).padStart(2, "0")}
              </span>
              <SystemLabel>{p.sub}</SystemLabel>
              <p className="mt-3 font-display text-3xl sm:text-4xl font-black text-foreground group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-b group-hover:from-white group-hover:to-white/80 transition-colors">
                <Counter to={p.amount} prefix="₹" />
              </p>
              <h3 className="mt-3 font-display text-xs sm:text-sm font-bold tracking-[0.2em] sm:tracking-[0.24em] text-primary">
                {p.title}
              </h3>
            </article>
          </Reveal>
        ))}
      </div>

      {/* Special awards */}
      <Reveal>
        <div className="mt-6">
          <SystemLabel className="text-primary font-bold">SPECIAL AWARDS</SystemLabel>
          <div className="mt-3 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {SPECIAL_AWARDS.map((a, i) => (
              <div
                key={a}
                className="group rounded-lg border border-border/80 bg-card/40 backdrop-blur-sm px-4 py-3 sm:px-5 sm:py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/70 hover:shadow-[0_6px_20px_-8px_rgba(225,29,72,0.2)]"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[0.6rem] text-muted-foreground/50 group-hover:text-primary transition-colors">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[0.65rem] sm:text-[0.7rem] tracking-[0.16em] sm:tracking-[0.18em] text-muted-foreground group-hover:text-foreground transition-colors">
                    {a}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/* ------------------------------ SPONSORS ------------------------------ */

export { SponsorsSection } from "./sponsors-section";


/* ----------------------------- ORGANIZERS ----------------------------- */

export function OrganizersSection() {
  return (
    <Section id="organizers">
      <Reveal>
        <SectionHeading code="SYSTEM 07 / ORGANIZERS" title="The team behind APEX 1.0" />
      </Reveal>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ORGANIZERS.map((o, i) => (
          <Reveal key={o.name} delay={i * 0.05}>
            <article className="glass-panel flex h-full items-center gap-4 rounded-xl p-5">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-primary/40 bg-primary/10 font-display text-sm font-black text-primary">
                {o.initials}
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-display text-base font-bold tracking-[0.14em]">
                  {o.name}
                </h3>
                <p className="text-sm text-muted-foreground">{o.role}</p>
                <div className="mt-1.5 flex gap-3">
                  <a href="#" className="font-mono text-[0.65rem] tracking-[0.16em] text-muted-foreground hover:text-primary">
                    LINKEDIN
                  </a>
                  <a href="#" className="font-mono text-[0.65rem] tracking-[0.16em] text-muted-foreground hover:text-primary">
                    GITHUB
                  </a>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* -------------------------------- VENUE -------------------------------- */

export function VenueSection() {
  return (
    <Section id="venue">
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <Reveal>
          <SectionHeading code="SYSTEM 07 / VENUE" title="APEX 1.0 HQ" />
          <dl className="mt-8 space-y-5">
            {[
              ["VENUE", "TECH CONVENTION CENTRE"],
              ["CITY", "BHOPAL, MADHYA PRADESH"],
              ["DATE", "14–15 MARCH 2026"],
              ["EVENT TIME", "10:00 AM — 04:00 PM"],
              ["ROUND", "ROUND 02 · OFFLINE"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="system-label">{k}</dt>
                <dd className="mt-1 font-display text-base font-bold tracking-[0.14em]">{v}</dd>
              </div>
            ))}
          </dl>
          <Button asChild variant="outline" className="mt-6 sm:mt-8 bg-transparent font-mono text-xs tracking-[0.18em] w-full sm:w-auto min-h-[44px]">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Bhopal+Madhya+Pradesh"
              target="_blank"
              rel="noreferrer"
            >
              GET DIRECTIONS <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="glass-panel scanlines relative grid aspect-square max-h-72 sm:max-h-80 md:aspect-[4/3] md:max-h-none place-items-center overflow-hidden rounded-xl">
            <div className="absolute inset-0 grid-veil" aria-hidden />

            {/* Animated ping dot */}
            <div className="relative">
              <span className="absolute -left-1 -top-1 h-8 w-8 animate-ping rounded-full bg-primary/20" aria-hidden />
              <MapPin className="relative h-8 w-8 text-primary" />
            </div>

            {/* Central info block */}
            <div className="absolute bottom-0 left-0 right-0 bg-card/60 backdrop-blur-sm p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-mono text-[0.5rem] tracking-[0.2em] text-muted-foreground/60">COORDINATES</p>
                  <p className="mt-0.5 font-mono text-[0.65rem] font-semibold text-foreground/80">23.2599° N, 77.4126° E</p>
                </div>
                <div>
                  <p className="font-mono text-[0.5rem] tracking-[0.2em] text-muted-foreground/60">REGION</p>
                  <p className="mt-0.5 font-mono text-[0.65rem] font-semibold text-foreground/80">BHOPAL // MP // INDIA</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[0.5rem] tracking-widest text-primary">
                  <span className="h-1 w-1 rounded-full bg-primary" aria-hidden /> ROUND 02 · OFFLINE
                </span>
                <span className="font-mono text-[0.5rem] tracking-[0.18em] text-muted-foreground/50">
                  14–15 MAR 2026
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* --------------------------------- FAQ --------------------------------- */

export function FaqSection() {
  // Split into two columns for desktop
  const mid = Math.ceil(FAQS.length / 2);
  const col1 = FAQS.slice(0, mid);
  const col2 = FAQS.slice(mid);

  return (
    <Section id="faq">
      <Reveal>
        <SectionHeading code="SYSTEM 08 / FAQ" title="Frequently Asked Questions" subtitle="Everything you need to know about APEX 1.0." />
      </Reveal>
      <Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Accordion type="single" collapsible>
            {col1.map((f, i) => (
              <AccordionItem key={f.q} value={`q-${i}`} className="border-border/70">
                <AccordionTrigger className="text-left font-display text-sm font-bold uppercase tracking-[0.12em] hover:text-primary">
                  <span className="mr-3 font-mono text-[0.6rem] text-muted-foreground/50">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <Accordion type="single" collapsible>
            {col2.map((f, i) => (
              <AccordionItem key={f.q} value={`q-${mid + i}`} className="border-border/70">
                <AccordionTrigger className="text-left font-display text-sm font-bold uppercase tracking-[0.12em] hover:text-primary">
                  <span className="mr-3 font-mono text-[0.6rem] text-muted-foreground/50">
                    {String(mid + i + 1).padStart(2, "0")}
                  </span>
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Reveal>
    </Section>
  );
}

/* --------------------------------- CTA --------------------------------- */

export function FinalCta() {
  return (
    <section className="relative overflow-hidden void-bg px-5 py-24 text-center sm:px-8">
      <div className="grain absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-2xl">
        <SystemLabel className="text-primary">ROUND: 01 · STATUS: OPEN</SystemLabel>
        <h2 className="mt-4 font-display text-3xl font-black uppercase sm:text-4xl">
          The stage is set.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Bring a team. Bring an idea. Build the future.
        </p>

        {/* Stat badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {[
            "₹30,000+ POOL",
            "GRAND FINALE",
            "OPEN INNOVATION",
          ].map((s) => (
            <span
              key={s}
              className="rounded-full border border-border bg-card/40 px-3 py-1 font-mono text-[0.6rem] tracking-[0.18em] text-muted-foreground"
            >
              {s}
            </span>
          ))}
        </div>

        <Button asChild size="lg" className="group mt-8 glow-primary font-mono text-xs tracking-[0.2em] w-full sm:w-auto min-h-[44px]">
          <Link to="/register">
            ENTER THE HACKATHON <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
