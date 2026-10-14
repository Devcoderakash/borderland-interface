import { Link } from "@tanstack/react-router";
import { type ReactNode } from "react";

import { SystemLabel } from "@/components/site/bits";

const ADMIN_NAV = [
  { to: "/admin", label: "OVERVIEW" },
  { to: "/admin/registrations", label: "REGISTRATIONS" },
] as const;

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-3.5">
          <div className="flex min-w-0 items-center gap-4 sm:gap-6">
            <Link to="/" className="flex items-center gap-2 shrink-0 font-display text-sm font-black tracking-widest">
              <img
                src="/favicon-32x32.png"
                alt="APEX Logo"
                className="h-5 w-5 object-contain drop-shadow-[0_0_6px_rgba(225,29,72,0.5)]"
              />
              <span>
                APEX<span className="text-primary">//</span>1.0
              </span>
            </Link>
            <nav aria-label="Admin" className="hidden gap-1 md:flex">
              {ADMIN_NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="rounded px-3 py-1.5 font-mono text-[0.68rem] tracking-[0.16em] text-muted-foreground hover:text-foreground transition-colors"
                  activeProps={{ className: "text-foreground bg-secondary font-bold" }}
                  activeOptions={{ exact: n.to === "/admin" }}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-[0.65rem] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              ADMIN MODE (DIRECT ACCESS)
            </span>
            <Link
              to="/"
              className="rounded-md border border-border/60 bg-transparent px-3 py-1.5 font-mono text-[0.68rem] tracking-[0.16em] text-muted-foreground hover:text-foreground transition-colors"
            >
              EXIT TO SITE →
            </Link>
          </div>
        </div>
        <nav aria-label="Admin mobile" className="flex gap-2 overflow-x-auto px-4 pb-2.5 md:hidden">
          {ADMIN_NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="whitespace-nowrap rounded-md px-3 py-1.5 font-mono text-[0.68rem] tracking-[0.16em] text-muted-foreground bg-card/40 border border-border/40"
              activeProps={{ className: "text-primary font-bold bg-primary/10 border-primary/40" }}
              activeOptions={{ exact: n.to === "/admin" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-10">
        <SystemLabel className="text-primary text-[0.65rem] sm:text-xs">ADMIN CONTROL</SystemLabel>
        <h1 className="mt-1.5 font-display text-2xl sm:text-3xl md:text-4xl font-black uppercase break-words">{title}</h1>
        <div className="mt-6 sm:mt-8">{children}</div>
      </div>
    </div>
  );
}
