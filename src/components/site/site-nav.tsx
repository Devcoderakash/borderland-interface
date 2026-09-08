import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "HOME" },
  { to: "/games", label: "THE GAMES" },
  { to: "/rules", label: "THE RULES" },
  { to: "/timeline", label: "TIMELINE" },
  { to: "/prizes", label: "PRIZES" },
  { to: "/leaderboard", label: "LEADERBOARD" },
  { to: "/faq", label: "FAQ" },
] as const;

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "px-3 pt-3" : "px-0 pt-0",
      )}
    >
      <nav
        aria-label="Main"
        className={cn(
          "mx-auto flex max-w-6xl items-center gap-4 transition-all duration-300",
          scrolled
            ? "glass-panel rounded-lg px-4 py-2.5"
            : "border-b border-border/60 bg-background/70 px-5 py-4 backdrop-blur-sm sm:px-8",
        )}
      >
        <Link
          to="/"
          className="font-display text-base font-black tracking-widest text-foreground"
          onClick={() => setOpen(false)}
        >
          BORDER<span className="text-primary">//</span>LAND
        </Link>

        <ul className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="rounded px-3 py-2 font-mono text-[0.7rem] tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Button asChild size="sm" className="hidden font-mono text-[0.7rem] tracking-[0.16em] sm:inline-flex">
            <Link to="/register">REGISTER NOW</Link>
          </Button>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded border border-border text-foreground lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="mx-auto mt-2 max-w-6xl lg:hidden">
          <ul className="glass-panel grid gap-1 rounded-lg p-3">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block rounded px-3 py-2.5 font-mono text-xs tracking-[0.18em] text-muted-foreground hover:bg-secondary hover:text-foreground"
                  activeProps={{ className: "text-foreground" }}
                  activeOptions={{ exact: item.to === "/" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Button asChild className="mt-1 w-full font-mono text-xs tracking-[0.18em]">
                <Link to="/register" onClick={() => setOpen(false)}>
                  REGISTER NOW
                </Link>
              </Button>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
