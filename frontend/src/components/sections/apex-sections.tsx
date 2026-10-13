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
    <section className="relative flex flex-col justify-start sm:justify-between overflow-x-clip bg-[#08070B] px-4 pt-20 pb-8 sm:min-h-[100svh] sm:px-8 sm:pt-28 md:pb-12 lg:min-h-screen lg:justify-center lg:pb-24">
      {/* Cinematic Animated Background */}
      <CinematicHeroBackground />

      <div className="relative z-10 mx-auto w-full max-w-7xl my-0 sm:my-auto py-1 sm:py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            className="reveal-safe flex flex-col justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF2345]/50 bg-[#FF2345]/10 px-3 py-1 w-fit shadow-[0_0_16px_rgba(255,35,69,0.3)] backdrop-blur-md">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF2345]" aria-hidden />
              <SystemLabel className="text-[#FF2345] text-[0.62rem] sm:text-[0.65rem] tracking-[0.18em] font-bold">
                ROUND 01 LIVE · REGISTRATIONS OPEN
              </SystemLabel>
            </div>

            <h1 className="mt-3.5 sm:mt-6 font-display text-[clamp(2.5rem,8.5vw,4.5rem)] lg:text-7xl xl:text-8xl font-black leading-[0.95] tracking-tight text-white break-words">
              APEX<span className="text-[#FF2345] drop-shadow-[0_0_18px_rgba(255,35,69,0.6)]">//</span>1.0
            </h1>

            <div className="mt-2 sm:mt-4 flex items-center gap-2 font-display font-black uppercase tracking-tight text-xl xs:text-2xl sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="text-white">
                ONE IDEA.
              </span>
              <span className="text-[#FF2345] drop-shadow-[0_0_12px_rgba(255,35,69,0.5)]">
                NO LIMITS.
              </span>
            </div>

            <p className="mt-3 sm:mt-6 max-w-lg text-[0.875rem] sm:text-base md:text-lg text-[#B8B4BE] leading-relaxed font-normal">
              A premier open-innovation hackathon where students build, innovate, pitch, and compete to create impactful solutions.
            </p>

            <div className="mt-5 sm:mt-8 flex flex-col gap-2.5 sm:flex-row sm:gap-4 w-full sm:w-auto">
              <Button asChild size="lg" className="group h-12 w-full sm:w-auto px-6 sm:px-8 bg-[#FF2345] hover:bg-[#FF2345]/90 text-white font-mono text-xs tracking-[0.16em] sm:tracking-[0.2em] rounded-xl shadow-[0_0_24px_rgba(255,35,69,0.45)] hover:shadow-[0_0_32px_rgba(255,35,69,0.7)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 min-h-[48px]">
                <Link to="/register">
                  ENTER THE HACKATHON <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="group h-12 w-full sm:w-auto px-6 sm:px-8 border border-white/[0.14] bg-[rgba(12,10,16,0.82)] hover:bg-[rgba(255,35,69,0.12)] hover:border-[#FF2345]/50 text-[#B8B4BE] hover:text-white font-mono text-xs tracking-[0.16em] sm:tracking-[0.2em] rounded-xl backdrop-blur-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 min-h-[48px]"
              >
                <a href="#roadmap">
                  EXPLORE THE ROADMAP <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
                </a>
              </Button>
            </div>

            {/* Mobile: Refined Glassmorphism Event Overview Card */}
            <div className="sm:hidden mt-4.5 w-full rounded-2xl border border-white/[0.14] bg-[rgba(12,10,16,0.82)] backdrop-blur-xl p-4 shadow-[0_16px_40px_rgba(0,0,0,0.8)]">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#FF2345] shadow-[0_0_8px_#FF2345] animate-pulse" />
                  <span className="font-mono text-[0.62rem] tracking-[0.2em] text-white font-bold uppercase">
                    EVENT OVERVIEW
                  </span>
                </div>
                <span className="font-mono text-xs tracking-wider text-[#FF2345] font-bold">
                  14–15 MAR 2026
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 text-center">
                <div className="border-r border-white/[0.08] pr-1">
                  <p className="font-mono text-[0.55rem] tracking-[0.18em] text-[#B8B4BE] uppercase">
                    PRIZE POOL
                  </p>
                  <p className="mt-1 font-display text-base font-black text-[#FF2345] tracking-tight drop-shadow-[0_0_10px_rgba(255,35,69,0.5)]">
                    ₹30,000
                  </p>
                </div>
                <div className="border-r border-white/[0.08] pr-1">
                  <p className="font-mono text-[0.55rem] tracking-[0.18em] text-[#B8B4BE] uppercase">
                    TEAM SIZE
                  </p>
                  <p className="mt-1 font-display text-base font-bold text-white tracking-wider">
                    1–4
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[0.55rem] tracking-[0.18em] text-[#B8B4BE] uppercase">
                    LOCATION
                  </p>
                  <p className="mt-1 font-display text-xs xs:text-sm font-bold text-white tracking-wider truncate">
                    BHOPAL, MP
                  </p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-white/[0.08] flex items-center justify-between font-mono text-[0.62rem]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#FF2345] font-bold">R1:</span>
                  <span className="text-white/80">ONLINE PPT</span>
                </div>
                <span className="text-[#B8B4BE]/40 px-1">&rarr;</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#FF2345] font-bold">R2:</span>
                  <span className="text-white/80">OFFLINE FINALE</span>
                </div>
              </div>
            </div>

            <div className="hidden sm:block mt-3.5 sm:mt-7 border-l-2 border-primary/50 pl-3 sm:pl-4 py-0.5 sm:py-1">
              <p className="font-serif italic text-white/60 text-xs sm:text-base tracking-wide">
                “Ideas don’t wait. Neither should you.”
              </p>
              <p className="mt-0.5 font-mono text-[0.6rem] sm:text-[0.65rem] tracking-[0.18em] text-white/35 uppercase">
                — APEX 1.0
              </p>
            </div>

            <div className="hidden sm:block mt-6 sm:mt-10 lg:mt-16">
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
                  <div className="flex justify-between border-t border-border/40 pt-1.5">
                    <span className="text-muted-foreground">STATUS:</span>
                    <span className="text-emerald-400 font-mono font-semibold tracking-wider flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE · T-{remaining}
                    </span>
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

      {/* Bottom Information Bar - Desktop Ribbon */}
      <div className="hidden sm:block relative z-20 mt-4 sm:mt-6 w-full border-t border-white/[0.08] bg-background/90 backdrop-blur-md lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:mt-0 lg:bg-background/70 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.5)]">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-8 sm:py-4">
          {/* Tablet & Desktop: Inline ribbon */}
          <div className="grid sm:grid-cols-4 lg:flex lg:w-full lg:items-center lg:justify-between lg:gap-4 xl:gap-6">
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
                  "group flex flex-col justify-center p-2 lg:p-0 min-w-0 transition-all duration-200",
                  i === 6 ? "sm:col-span-2 lg:col-span-1" : ""
                )}
              >
                <div className="flex items-center min-w-0">
                  {i > 0 && <div className="hidden h-8 w-px bg-border/40 mr-6 lg:block" aria-hidden />}
                  <div className="min-w-0 flex-1">
                    <dt className="font-mono text-[0.55rem] sm:text-[0.6rem] tracking-[0.16em] text-muted-foreground truncate uppercase group-hover:text-foreground/70 transition-colors">
                      {k}
                    </dt>
                    <dd className={cn(
                      "mt-0.5 font-display text-xs sm:text-sm font-bold tracking-wider whitespace-normal break-words transition-colors",
                      k === "PRIZE POOL" ? "text-primary group-hover:text-primary font-black" : "text-foreground group-hover:text-primary"
                    )}>
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
      <a
        href="#welcome"
        aria-label="Scroll to explore about APEX 1.0"
        className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 hidden lg:flex flex-col items-center group cursor-pointer transition-opacity hover:opacity-100 opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded p-1"
      >
        <p className="font-mono text-[0.55rem] tracking-[0.25em] text-white/50 mb-1 group-hover:text-primary transition-colors">
          SCROLL TO EXPLORE
        </p>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowRight className="h-3.5 w-3.5 text-primary rotate-90" />
        </motion.div>
      </a>
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
          <div className="mt-5 sm:mt-6 space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <p>
              You have entered <strong className="text-foreground font-semibold">APEX 1.0</strong> — a premier open-innovation hackathon engineered for student builders and problem solvers.
            </p>
            <p>
              Students collaborate across domains to design, prototype, and pitch impactful solutions for real-world challenges with zero domain restrictions.
            </p>

            {/* Two-round sequential timeline flow */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="relative pl-3.5 border-l-2 border-primary/70 py-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[0.6rem] tracking-[0.2em] text-primary uppercase font-bold">ROUND 01 · ONLINE</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                </div>
                <p className="mt-1 font-display text-sm font-bold text-foreground">Idea Submission & PPT Pitch</p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  Submit your innovation concept and slide deck for jury shortlisting.
                </p>
              </div>
              <div className="relative pl-3.5 border-l-2 border-white/20 py-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[0.6rem] tracking-[0.2em] text-white/50 uppercase font-bold">ROUND 02 · OFFLINE</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                </div>
                <p className="mt-1 font-display text-sm font-bold text-foreground">Grand Finale Build & Demo</p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  Shortlisted teams prototype and pitch live at Bhopal, MP.
                </p>
              </div>
            </div>

            <p className="mt-4 font-display text-xs sm:text-sm font-bold tracking-[0.22em] text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-primary uppercase">
              BRING YOUR BEST IDEAS. NO LIMITS.
            </p>
          </div>
          <Button asChild variant="outline" className="group mt-6 sm:mt-8 border-border/80 bg-card/30 hover:border-primary/50 hover:bg-primary/10 font-mono text-xs tracking-[0.18em] w-full sm:w-auto min-h-[44px]">
            <Link to="/rules">
              EXPLORE EVENT RULES <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </Button>
        </Reveal>

        <Reveal delay={0.1} className="hidden md:block">
          <div className="scanlines relative grid aspect-square max-h-56 place-items-center overflow-hidden rounded-xl border border-border/40 bg-card/20 sm:max-h-80 md:max-h-none">
            <div className="absolute inset-0 grid-veil" aria-hidden />
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                aria-hidden
                className="absolute rounded-full border border-primary/30"
                style={{
                  width: `${40 + i * 22}%`,
                  height: `${40 + i * 22}%`,
                  animation: `pulse-ring 3.4s ${i * 1.1}s ease-out infinite`,
                }}
              />
            ))}
            <div className="relative grid h-20 w-20 sm:h-28 sm:w-28 place-items-center rounded-xl border border-primary/50 bg-card/90 text-center font-display glow-primary float-card p-3 sm:p-4">
              <Terminal className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <div className="mt-1 font-display text-xs sm:text-sm font-black tracking-widest text-foreground">
                APEX<span className="text-primary">//</span>1.0
              </div>
            </div>
            {/* Corner micro-labels */}
            <span className="absolute left-3.5 top-3.5 font-mono text-[0.5rem] tracking-[0.2em] text-muted-foreground/40" aria-hidden>
              STATUS: ACTIVE
            </span>
            <span className="absolute right-3.5 top-3.5 font-mono text-[0.5rem] tracking-[0.2em] text-muted-foreground/40" aria-hidden>
              APX//01
            </span>
            <p className="absolute bottom-2.5 sm:bottom-5 system-label text-[0.5rem] sm:text-[0.6875rem] text-center px-2">PORTAL: ACTIVE · REGISTRATIONS: OPEN</p>
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

      {/* Mobile: Clean numbered editorial list (Zero box clutter) */}
      <div className="mt-8 divide-y divide-border/25 sm:hidden">
        {EVALUATION_CRITERIA.map((criterion, i) => (
          <Reveal key={criterion.id} delay={i * 0.05}>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="w-full text-left py-4 px-1 group transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className={cn("font-mono text-sm font-black shrink-0 pt-0.5", criterion.colorClass)}>
                        {criterion.id}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2">
                          <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
                            {criterion.name}
                          </h3>
                          <span className="font-mono text-[0.6rem] tracking-wider text-muted-foreground">
                            / {criterion.role}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                          {criterion.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={cn("font-display text-lg font-black tracking-tight", criterion.colorClass)}>
                        {criterion.weightage}
                      </span>
                      <p className="font-mono text-[0.55rem] tracking-wider text-muted-foreground/60 uppercase">
                        WEIGHT
                      </p>
                    </div>
                  </div>
                  {/* Subtle progress line */}
                  <div className="mt-3 h-0.5 w-full rounded-full bg-border/30 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", criterion.bgClass.replace("/10", "/80"))}
                      style={{ width: `${criterion.pct}%` }}
                    />
                  </div>
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

      {/* Tablet & Desktop: 2-column cards */}
      <div className="mt-10 hidden sm:grid gap-4 sm:grid-cols-2">
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

      {/* ── Mobile: Sleek coherent vertical timeline (Zero bulky cards) ── */}
      <div className="relative mt-8 md:hidden pl-7">
        {/* Continuous timeline vertical stem line */}
        <div className="absolute left-[11px] top-3 bottom-6 w-px bg-gradient-to-b from-primary/80 via-primary/30 to-border/40" />

        <ol className="space-y-5">
          {ROADMAP.map((g, i) => (
            <Reveal key={g.id} delay={i * 0.05}>
              <li className="relative group">
                {/* Milestone node circle on the timeline stem */}
                <div
                  className={cn(
                    "absolute -left-[23px] top-0.5 grid h-6 w-6 place-items-center rounded-full border text-[0.6rem] font-mono font-bold transition-all",
                    g.active
                      ? "border-primary bg-primary text-primary-foreground shadow-[0_0_12px_rgba(225,29,72,0.8)]"
                      : "border-border/80 bg-background text-muted-foreground group-hover:border-primary/50 group-hover:text-foreground"
                  )}
                >
                  {g.n}
                </div>

                {/* Milestone content */}
                <div className={cn(
                  "pt-0.5 pb-2 transition-all",
                  g.active && "pl-2.5 rounded-r-lg bg-primary/[0.04] border-l-2 border-primary -ml-2"
                )}>
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <h3 className={cn(
                      "font-display text-xs sm:text-sm font-black uppercase tracking-wider",
                      g.active ? "text-primary text-glow" : "text-foreground"
                    )}>
                      {g.title}
                    </h3>
                    <span className={cn(
                      "inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[0.55rem] font-bold tracking-widest",
                      g.active
                        ? "border border-primary/40 bg-primary/10 text-primary"
                        : "border border-border/60 bg-muted/20 text-muted-foreground"
                    )}>
                      {g.window}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {g.text}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
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
      {/* Mobile: Clean editorial numbered list (Zero box clutter) */}
      <div className="mt-8 divide-y divide-border/25 sm:hidden">
        {RULES.map((r, i) => (
          <Reveal key={r.n} delay={i * 0.04}>
            <article className="py-3.5 flex items-start gap-3.5 group">
              <span className="font-mono text-sm font-black text-primary/80 shrink-0 pt-0.5">
                {r.n}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xs font-bold tracking-widest text-foreground uppercase group-hover:text-primary transition-colors">
                  {r.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {r.text}
                </p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      {/* Tablet & Desktop: Multi-column cards */}
      <div className="mt-12 hidden sm:grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Grand champion – prominently featured centerpiece */}
      <Reveal>
        <div className="mt-8 sm:mt-12 glass-panel relative overflow-hidden rounded-xl border-primary/60 glow-primary p-5 sm:p-12 text-center shadow-[0_20px_60px_-15px_rgba(225,29,72,0.25)]">
          <div className="hair-line absolute top-0 inset-x-0" />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.08] via-transparent to-transparent" aria-hidden />
          <span className="pointer-events-none absolute -right-10 -top-10 select-none font-display text-[8rem] sm:text-[12rem] font-black leading-none text-foreground/[0.02]" aria-hidden>01</span>

          <div className="mx-auto mb-2.5 sm:mb-3 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-primary/60 bg-primary/15 text-primary shadow-[0_0_24px_rgba(225,29,72,0.4)]">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>

          <SystemLabel className="text-primary font-bold tracking-[0.25em]">FIRST PLACE</SystemLabel>
          <p className="mt-2.5 sm:mt-4 font-display text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white/95 to-white/70 drop-shadow-[0_0_25px_rgba(225,29,72,0.35)]">
            <Counter to={18000} prefix="₹" />
          </p>
          <h3 className="mt-2 sm:mt-3 font-display text-sm sm:text-lg font-bold tracking-[0.18em] sm:tracking-[0.3em] text-primary">
            1ST PRIZE — GRAND CHAMPION
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            The team demonstrating the highest combined score across all four judging criteria.
          </p>
        </div>
      </Reveal>

      {/* Runner up + Second runner up - compact side-by-side */}
      <div className="mt-3.5 sm:mt-5 grid gap-3 sm:gap-5 grid-cols-2">
        {PRIZES.slice(1).map((p, i) => (
          <Reveal key={p.title} delay={(i + 1) * 0.08}>
            <article className="glass-panel group relative h-full overflow-hidden rounded-xl p-3.5 sm:p-7 text-center transition-all duration-300 hover:border-primary/40 hover:-translate-y-0.5">
              <SystemLabel className="text-[0.55rem] sm:text-xs text-muted-foreground/80">{p.sub}</SystemLabel>
              <p className="mt-1 sm:mt-3 font-display text-2xl sm:text-4xl font-black text-foreground group-hover:text-primary transition-colors">
                <Counter to={p.amount} prefix="₹" />
              </p>
              <h3 className="mt-1 sm:mt-3 font-display text-[0.65rem] sm:text-sm font-bold tracking-[0.14em] sm:tracking-[0.24em] text-primary truncate">
                {p.title}
              </h3>
            </article>
          </Reveal>
        ))}
      </div>

      {/* Special awards - clean minimal tag list */}
      <Reveal>
        <div className="mt-6 pt-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-1.5 w-1.5 bg-primary rotate-45" />
            <SystemLabel className="text-primary font-bold tracking-[0.2em]">SPECIAL RECOGNITION AWARDS</SystemLabel>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {SPECIAL_AWARDS.map((a, i) => (
              <div
                key={a}
                className="group flex items-center gap-2 rounded-lg border border-border/40 bg-card/25 px-2.5 py-2 sm:px-4 sm:py-3 transition-colors hover:border-primary/40"
              >
                <span className="font-mono text-[0.6rem] text-primary/70 font-bold shrink-0">
                  0{i + 1}
                </span>
                <span className="font-mono text-[0.6rem] sm:text-xs tracking-wider text-muted-foreground group-hover:text-foreground transition-colors truncate">
                  {a}
                </span>
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

      {/* Mobile: Clean list with subtle hairlines (no repeated box overload) */}
      <div className="mt-8 divide-y divide-white/[0.06] border-y border-white/[0.06] sm:hidden">
        {ORGANIZERS.map((o) => (
          <div key={o.name} className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/10 font-display text-xs font-bold text-primary">
                {o.initials}
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-display text-sm font-bold tracking-wider text-foreground">
                  {o.name}
                </h3>
                <p className="truncate text-xs text-muted-foreground">{o.role}</p>
              </div>
            </div>
            <div className="flex gap-2.5 shrink-0 pl-2">
              <a href="#" className="font-mono text-[0.6rem] tracking-wider text-muted-foreground hover:text-primary py-1 px-1.5">
                LI
              </a>
              <a href="#" className="font-mono text-[0.6rem] tracking-wider text-muted-foreground hover:text-primary py-1 px-1.5">
                GH
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Grid cards */}
      <div className="mt-12 hidden sm:grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
  const mid = Math.ceil(FAQS.length / 2);
  const col1 = FAQS.slice(0, mid);
  const col2 = FAQS.slice(mid);

  return (
    <Section id="faq">
      <Reveal>
        <SectionHeading code="SYSTEM 08 / FAQ" title="Frequently Asked Questions" subtitle="Everything you need to know about APEX 1.0." />
      </Reveal>
      <Reveal>
        {/* Mobile: Unified single accordion with delicate hairline dividers & readable sentence-case questions */}
        <div className="mt-8 md:hidden">
          <Accordion type="single" collapsible className="divide-y divide-border/25 border-y border-border/25">
            {FAQS.map((f, i) => (
              <AccordionItem key={f.q} value={`faq-m-${i}`} className="border-none py-0.5">
                <AccordionTrigger className="text-left py-3.5 hover:no-underline group">
                  <div className="flex items-start gap-2.5 pr-2">
                    <span className="mt-0.5 font-mono text-[0.65rem] font-semibold text-primary/80 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-sans text-sm font-semibold tracking-normal text-foreground group-hover:text-primary transition-colors leading-snug">
                      {f.q}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-6 pr-2 pb-3.5 text-xs text-muted-foreground leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Desktop: 2-column layout */}
        <div className="mt-10 hidden md:grid md:grid-cols-2 md:gap-8">
          <Accordion type="single" collapsible>
            {col1.map((f, i) => (
              <AccordionItem key={f.q} value={`q-${i}`} className="border-border/60">
                <AccordionTrigger className="text-left font-display text-sm font-bold tracking-[0.06em] hover:text-primary">
                  <span className="mr-3 font-mono text-[0.65rem] text-primary/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pl-7">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <Accordion type="single" collapsible>
            {col2.map((f, i) => (
              <AccordionItem key={f.q} value={`q-${mid + i}`} className="border-border/60">
                <AccordionTrigger className="text-left font-display text-sm font-bold tracking-[0.06em] hover:text-primary">
                  <span className="mr-3 font-mono text-[0.65rem] text-primary/70">
                    {String(mid + i + 1).padStart(2, "0")}
                  </span>
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pl-7">{f.a}</AccordionContent>
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
