import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SystemLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn("system-label", className)}>{children}</span>;
}

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  code,
  title,
  subtitle,
  className,
}: {
  code: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <div className="flex items-center gap-2.5 sm:gap-3">
        <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rotate-45 bg-primary shadow-[0_0_10px_rgba(225,29,72,0.6)]" aria-hidden />
        <SystemLabel className="text-[0.65rem] sm:text-xs tracking-[0.18em]">{code}</SystemLabel>
      </div>
      <h2 className="mt-3 sm:mt-4 text-2xl font-black uppercase tracking-tight sm:text-4xl md:text-5xl break-words text-transparent bg-clip-text bg-gradient-to-b from-white via-white/95 to-white/80">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-2.5 sm:mt-4 text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">{subtitle}</p>
      ) : null}
    </div>
  );
}

export function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("relative px-4 py-12 sm:px-8 sm:py-20 md:py-28 overflow-x-clip", className)}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

export function Counter({
  to,
  prefix = "",
  duration = 1400,
}: {
  to: number;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setValue(to);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to, duration, reduced]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toLocaleString("en-IN")}
    </span>
  );
}

export function Difficulty({ level }: { level: number }) {
  return (
    <span className="font-mono text-sm tracking-[0.3em] text-primary" aria-label={`Difficulty ${level} of 5`}>
      {"★".repeat(level)}
      <span className="text-muted-foreground">{"☆".repeat(5 - level)}</span>
    </span>
  );
}

export function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "border-accent-3/50 bg-accent-3/10 text-accent-3",
    pending: "border-accent-2/50 bg-accent-2/10 text-accent-2",
    rejected: "border-primary/50 bg-primary/10 text-primary",
    shortlisted: "border-accent-3/50 bg-accent-3/10 text-accent-3",
    active: "border-accent-2/50 bg-accent-2/10 text-accent-2",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.18em]",
        map[status] ?? "border-border bg-muted/40 text-muted-foreground",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {status}
    </span>
  );
}
