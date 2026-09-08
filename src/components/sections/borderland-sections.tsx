import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Lock, MapPin } from "lucide-react";
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
  Difficulty,
  Reveal,
  Section,
  SectionHeading,
  SystemLabel,
} from "@/components/site/bits";
import {
  FAQS,
  GAMES,
  ORGANIZERS,
  PRIZES,
  RULES,
  SPECIAL_AWARDS,
  SPONSOR_TIERS,
  SUITS,
  TIMELINE,
} from "@/lib/borderland";
import { cn } from "@/lib/utils";

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

const FLOATERS = [
  { symbol: "♠", className: "left-[6%] top-[24%] text-spade", tilt: "-8deg", delay: "0s" },
  { symbol: "♦", className: "right-[9%] top-[18%] text-diamond", tilt: "10deg", delay: "1.2s" },
  { symbol: "♣", className: "left-[14%] bottom-[16%] text-club", tilt: "6deg", delay: "2.4s" },
  { symbol: "♥", className: "right-[13%] bottom-[22%] text-heart", tilt: "-12deg", delay: "0.6s" },
];

export function Hero() {
  const remaining = useCountdown(
    new Date(Date.now() + 4 * 3600_000 + 32 * 60_000).toISOString(),
  );

  return (
    <section className="scanlines relative flex min-h-[100svh] items-center overflow-hidden void-bg px-5 pt-28 pb-16 sm:px-8">
      <div className="grid-veil pointer-events-none absolute inset-0" aria-hidden />
      <div className="grain pointer-events-none absolute inset-0" aria-hidden />

      <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
        {FLOATERS.map((f) => (
          <div
            key={f.symbol}
            style={{ ["--tilt" as string]: f.tilt, animationDelay: f.delay }}
            className={cn(
              "float-card absolute grid h-28 w-20 place-items-center rounded-md border border-border/70 bg-card/40 text-3xl backdrop-blur-sm",
              f.className,
            )}
          >
            {f.symbol}
          </div>
        ))}
      </div>

      <div className="relative mx-auto w-full max-w-6xl">
        <motion.div
          className="reveal-safe"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" aria-hidden />
            <SystemLabel className="text-primary">SYSTEM STATUS: ONLINE</SystemLabel>
          </div>

          <h1 className="mt-7 font-display text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
            BORDER<span className="text-primary">//</span>LAND
          </h1>

          <p className="text-glow mt-6 font-display text-2xl font-black uppercase leading-[1.05] sm:text-4xl md:text-5xl">
            WHERE
            <br />
            CODE
            <br />
            MEETS
            <br />
            <span className="text-primary">SURVIVAL.</span>
          </p>

          <p className="mt-7 max-w-xl text-base text-muted-foreground sm:text-lg">
            A high-stakes technology hackathon where intelligence, creativity, teamwork and strategy
            determine who survives.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="glow-primary font-mono text-xs tracking-[0.2em]">
              <Link to="/register">
                ENTER THE BORDERLAND <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-border bg-transparent font-mono text-xs tracking-[0.2em]"
            >
              <Link to="/games">VIEW THE GAMES</Link>
            </Button>
          </div>

          <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-5 border-t border-border/60 pt-7 sm:grid-cols-4">
            {[
              ["PLAYERS REQUIRED", "2–4"],
              ["MODE", "TEAM"],
              ["DIFFICULTY", "UNKNOWN"],
              ["TIME REMAINING", remaining],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="system-label">{k}</dt>
                <dd className="mt-1.5 font-display text-base font-bold tracking-wide text-foreground sm:text-lg">
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <p className="mt-14 system-label animate-pulse">SCROLL TO ENTER ↓</p>
      </div>
    </section>
  );
}

/* ------------------------------ WELCOME ------------------------------ */

export function WelcomeSection() {
  return (
    <Section id="welcome" className="grain">
      <div className="grid gap-12 md:grid-cols-[1.15fr_1fr] md:items-center">
        <Reveal>
          <SectionHeading code="SYSTEM_01 / ORIENTATION" title="Welcome to the Borderland" />
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>You have entered a different kind of hackathon.</p>
            <p>Here, technical skills are only the beginning.</p>
            <p className="text-foreground">Every challenge tests something different:</p>
            <ul className="space-y-2 font-mono text-sm">
              {[
                "How fast can you think?",
                "How well can you work together?",
                "How much risk are you willing to take?",
                "Can you build when the rules suddenly change?",
              ].map((q) => (
                <li key={q} className="flex gap-3">
                  <span className="text-primary">›</span>
                  {q}
                </li>
              ))}
            </ul>
            <p className="font-display uppercase tracking-widest text-foreground">
              Only the teams that adapt survive.
            </p>
          </div>
          <Button asChild variant="outline" className="mt-8 bg-transparent font-mono text-xs tracking-[0.18em]">
            <Link to="/rules">
              UNDERSTAND THE RULES <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass-panel scanlines relative grid aspect-square place-items-center overflow-hidden rounded-xl">
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
            <div className="relative grid h-28 w-20 place-items-center rounded-md border border-primary/50 bg-card text-4xl text-primary glow-primary float-card">
              ♠
            </div>
            <p className="absolute bottom-5 system-label">PORTAL: OPEN · ENTRY WINDOW: ACTIVE</p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ------------------------------- SUITS ------------------------------- */

export function SuitsSection() {
  return (
    <Section id="suits">
      <Reveal>
        <SectionHeading
          code="SYSTEM_02 / CLASSIFICATION"
          title="The Four Suits"
          subtitle="Every player belongs to a suit. Your suit decides the kind of games you will face."
        />
      </Reveal>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {SUITS.map((suit, i) => (
          <Reveal key={suit.key} delay={i * 0.07}>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "group glass-panel relative w-full overflow-hidden rounded-xl p-6 text-left transition-all duration-300 hover:-translate-y-1 focus-visible:-translate-y-1 sm:p-8",
                    suit.borderClass,
                    "hover:shadow-[0_0_40px_-8px_currentColor]",
                    suit.colorClass,
                  )}
                >
                  <div className={cn("absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100", suit.bgClass)} aria-hidden />
                  <div className="relative flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <SystemLabel>{`SUIT_${String(i + 1).padStart(2, "0")}`}</SystemLabel>
                      <h3 className={cn("mt-2 font-display text-2xl font-black", suit.colorClass)}>
                        {suit.symbol} {suit.name}
                      </h3>
                      <p className="mt-1 font-display text-sm tracking-[0.22em] text-foreground">
                        {suit.role}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 text-5xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12",
                        suit.colorClass,
                      )}
                      aria-hidden
                    >
                      {suit.symbol}
                    </span>
                  </div>
                  <p className="relative mt-5 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
                    {suit.focus}
                  </p>
                  <p className="relative mt-3 text-sm text-muted-foreground">{suit.description}</p>
                  <div className="relative mt-5 max-h-0 overflow-hidden opacity-0 transition-all duration-500 group-hover:max-h-40 group-hover:opacity-100">
                    <ul className="flex flex-wrap gap-2">
                      {suit.examples.map((e) => (
                        <li
                          key={e}
                          className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground"
                        >
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="relative mt-6 font-mono text-[0.65rem] tracking-[0.2em] text-foreground/70">
                    VIEW CHALLENGES →
                  </p>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className={cn("font-display text-2xl", suit.colorClass)}>
                    {suit.symbol} {suit.name} — {suit.role}
                  </DialogTitle>
                  <DialogDescription className="font-mono text-[0.7rem] uppercase tracking-[0.16em]">
                    {suit.focus}
                  </DialogDescription>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">{suit.description}</p>
                <div>
                  <p className="system-label">CHALLENGE EXAMPLES</p>
                  <ul className="mt-3 grid gap-2 text-sm">
                    {suit.examples.map((e) => (
                      <li key={e} className="flex gap-2">
                        <span className={suit.colorClass}>›</span>
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button asChild className="mt-2 font-mono text-xs tracking-[0.18em]">
                  <Link to="/register">CHOOSE THIS SUIT</Link>
                </Button>
              </DialogContent>
            </Dialog>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------- GAMES ------------------------------- */

export function GamesSection() {
  return (
    <Section id="games">
      <Reveal>
        <SectionHeading
          code="SYSTEM_03 / PROGRESSION"
          title="The Games"
          subtitle="Every game tests a different ability."
        />
      </Reveal>

      <ol className="mt-12 space-y-4">
        {GAMES.map((g, i) => (
          <Reveal key={g.id} delay={i * 0.06}>
            <li className="glass-panel relative overflow-hidden rounded-xl p-6 sm:p-7">
              <span className="absolute left-0 top-0 h-full w-[3px] bg-primary/70" aria-hidden />
              <div className="grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                <div className="min-w-0">
                  <SystemLabel>{g.id}</SystemLabel>
                  <h3 className="mt-1.5 font-display text-xl font-black uppercase sm:text-2xl">
                    {g.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">{g.text}</p>
                <div className="sm:text-right">
                  <p className="system-label">DIFFICULTY</p>
                  <Difficulty level={g.difficulty} />
                </div>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>

      <Reveal>
        <div className="relative mt-8 overflow-hidden rounded-xl border border-accent/50 bg-card/40 p-7 text-center backdrop-blur-md glow-accent sm:p-12">
          <div className="absolute inset-0 grid-veil" aria-hidden />
          <div className="relative mx-auto grid h-40 w-28 place-items-center rounded-md border border-accent/60 bg-background/70 text-5xl text-accent float-card">
            🃏
          </div>
          <SystemLabel className="mt-6 block text-accent">FINAL GAME</SystemLabel>
          <h3 className="mt-2 font-display text-3xl font-black uppercase sm:text-4xl">THE JOKER</h3>
          <p className="mt-2 font-mono text-sm text-muted-foreground">DIFFICULTY: ???</p>
          <p className="mx-auto mt-5 max-w-xl text-sm text-muted-foreground">
            No predefined solution. Teams receive a surprise real-world problem and must design,
            build and pitch a solution under extreme time constraints.
          </p>
          <p className="mt-7 font-display text-lg font-black uppercase tracking-[0.28em] text-accent">
            THE RULES END HERE.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}

/* ------------------------------- JOKER ------------------------------- */

export function JokerSection() {
  return (
    <section className="scanlines relative overflow-hidden border-y border-border/70 void-bg px-5 py-24 sm:px-8 md:py-32">
      <div className="grain absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-3xl text-center">
        <Reveal>
          <h2 className="font-display text-4xl font-black uppercase sm:text-5xl">🃏 THE JOKER</h2>
          <p className="mt-4 font-display text-sm tracking-[0.28em] text-accent sm:text-base">
            THE GAME YOU CANNOT PREPARE FOR.
          </p>
          <div className="mx-auto mt-8 max-w-xl space-y-4 text-muted-foreground">
            <p>Every team thinks they know what comes next.</p>
            <p className="text-foreground">They don&apos;t.</p>
            <p>
              The Joker challenge is revealed only when the final round begins. No leaked problem
              statement. No predefined approach. No guaranteed solution.
            </p>
          </div>
          <p className="mt-8 font-display text-lg font-black leading-9 tracking-[0.3em] text-foreground">
            THINK.
            <br />
            BUILD.
            <br />
            ADAPT.
            <br />
            <span className="text-primary">SURVIVE.</span>
          </p>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="mt-10 glow-accent bg-accent font-mono text-xs tracking-[0.2em] text-accent-foreground hover:bg-accent/90">
                REVEAL THE JOKER
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md text-center">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-primary">
                  ACCESS DENIED
                </DialogTitle>
                <DialogDescription className="font-mono text-[0.7rem] uppercase tracking-[0.2em]">
                  SECURITY_LEVEL: HIGH
                </DialogDescription>
              </DialogHeader>
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-primary/50 bg-primary/10"
              >
                <Lock className="h-9 w-9 text-primary" />
              </motion.div>
              <p className="font-display text-sm tracking-[0.24em]">FINAL GAME LOCKED</p>
              <p className="text-sm text-muted-foreground">
                The challenge will be revealed at the event.
              </p>
            </DialogContent>
          </Dialog>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------- RULES ------------------------------- */

export function RulesSection() {
  return (
    <Section id="rules">
      <Reveal>
        <SectionHeading
          code="SYSTEM_04 / PROTOCOL"
          title="The Rules"
          subtitle="Seven protocols govern the Borderland. Breaking one ends your run."
        />
      </Reveal>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RULES.map((r, i) => (
          <Reveal key={r.n} delay={i * 0.05}>
            <article className="glass-panel h-full rounded-xl p-6">
              <p className="font-display text-3xl font-black text-primary/70">{r.n}</p>
              <h3 className="mt-3 font-display text-base font-bold tracking-[0.18em]">{r.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
            </article>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <Button asChild variant="outline" className="mt-8 bg-transparent font-mono text-xs tracking-[0.18em]">
          <Link to="/rules">
            READ COMPLETE RULEBOOK <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </Reveal>
    </Section>
  );
}

/* ------------------------------ TIMELINE ------------------------------ */

export function TimelineSection() {
  return (
    <Section id="timeline">
      <Reveal>
        <SectionHeading
          code="SYSTEM_05 / SCHEDULE"
          title="Timeline"
          subtitle="Two days. Five games. One survivor."
        />
      </Reveal>
      <div className="relative mt-12 pl-6 sm:pl-8">
        <span className="absolute left-0 top-2 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-primary/70 via-accent/50 to-transparent" aria-hidden />
        <ol className="space-y-6">
          {TIMELINE.map((t, i) => (
            <Reveal key={`${t.time}-${t.label}`} delay={i * 0.04}>
              <li className="relative">
                <span
                  className="absolute -left-6 top-2 h-2.5 w-2.5 rotate-45 border border-primary bg-background sm:-left-8"
                  aria-hidden
                />
                {i === 0 || TIMELINE[i - 1]?.day !== t.day ? (
                  <SystemLabel className="mb-2 block text-primary">{t.day}</SystemLabel>
                ) : null}
                <div className="glass-panel flex flex-wrap items-center gap-x-6 gap-y-1 rounded-lg px-5 py-3.5">
                  <span className="font-mono text-sm text-primary">{t.time}</span>
                  <span className="font-display text-sm font-bold tracking-[0.2em]">{t.label}</span>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  );
}

/* ------------------------------- PRIZES ------------------------------- */

export function PrizesSection() {
  return (
    <Section id="prizes">
      <Reveal>
        <SectionHeading
          code="SYSTEM_06 / REWARD"
          title="Prizes"
          subtitle="₹90,000 total prize pool, plus six special awards."
        />
      </Reveal>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {PRIZES.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.08}>
            <article
              className={cn(
                "glass-panel relative h-full overflow-hidden rounded-xl p-7 text-center",
                i === 0 && "border-primary/50 glow-primary",
              )}
            >
              <SystemLabel>{p.sub}</SystemLabel>
              <p className="mt-3 font-display text-4xl font-black text-foreground">
                <Counter to={p.amount} prefix="₹" />
              </p>
              <h3 className="mt-3 font-display text-sm font-bold tracking-[0.24em] text-primary">
                {p.title}
              </h3>
            </article>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SPECIAL_AWARDS.map((a) => (
            <div
              key={a}
              className="rounded-lg border border-border bg-card/40 px-5 py-4 font-mono text-[0.7rem] tracking-[0.18em] text-muted-foreground"
            >
              {a}
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

/* ------------------------------ SPONSORS ------------------------------ */

export function SponsorsSection() {
  return (
    <Section id="sponsors">
      <Reveal>
        <SectionHeading
          code="SYSTEM_07 / ALLIANCE"
          title="The organizers who keep the game alive"
        />
      </Reveal>
      <div className="mt-12 space-y-8">
        {SPONSOR_TIERS.map((t, ti) => (
          <Reveal key={t.tier} delay={ti * 0.05}>
            <div>
              <p className="system-label text-primary">{t.tier}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {Array.from({ length: t.slots }).map((_, i) => (
                  <div
                    key={i}
                    className="grid h-20 w-36 place-items-center rounded-lg border border-border bg-card/40 font-mono text-[0.65rem] tracking-[0.18em] text-muted-foreground grayscale transition-all duration-300 hover:border-primary/50 hover:text-foreground hover:grayscale-0"
                  >
                    LOGO {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ----------------------------- ORGANIZERS ----------------------------- */

export function OrganizersSection() {
  return (
    <Section id="organizers">
      <Reveal>
        <SectionHeading code="SYSTEM_08 / OPERATORS" title="The people behind the game" />
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
          <SectionHeading code="SYSTEM_09 / LOCATION" title="Border//Land HQ" />
          <dl className="mt-8 space-y-5">
            {[
              ["VENUE", "TECH CONVENTION CENTRE"],
              ["CITY", "BHOPAL, MADHYA PRADESH"],
              ["DATE", "14–15 MARCH 2026"],
              ["EVENT TIME", "10:00 AM — 04:00 PM"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="system-label">{k}</dt>
                <dd className="mt-1 font-display text-base font-bold tracking-[0.14em]">{v}</dd>
              </div>
            ))}
          </dl>
          <Button asChild variant="outline" className="mt-8 bg-transparent font-mono text-xs tracking-[0.18em]">
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
          <div className="glass-panel scanlines relative grid aspect-[4/3] place-items-center overflow-hidden rounded-xl">
            <div className="absolute inset-0 grid-veil" aria-hidden />
            <div className="relative text-center">
              <MapPin className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-3 system-label">MAP · COORDINATES LOCKED</p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* --------------------------------- FAQ --------------------------------- */

export function FaqSection() {
  return (
    <Section id="faq">
      <Reveal>
        <SectionHeading code="SYSTEM_10 / QUERY" title="FAQ" subtitle="Ask before you enter." />
      </Reveal>
      <Reveal>
        <Accordion type="single" collapsible className="mt-10">
          {FAQS.map((f, i) => (
            <AccordionItem key={f.q} value={`q-${i}`} className="border-border/70">
              <AccordionTrigger className="text-left font-display text-sm font-bold uppercase tracking-[0.12em] hover:text-primary">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
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
          One final game remains.
        </h2>
        <p className="mt-4 text-muted-foreground">
          The Joker is waiting. Bring a team. Bring a plan. Neither will be enough.
        </p>
        <Button asChild size="lg" className="mt-8 glow-primary font-mono text-xs tracking-[0.2em]">
          <Link to="/register">
            ENTER THE GAME <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
