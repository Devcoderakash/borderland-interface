import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  isHash?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "HOME" },
  { href: "/#roadmap", label: "ROADMAP", isHash: true },
  { href: "/rules", label: "RULES" },
  { href: "/prizes", label: "PRIZES" },
  { href: "/#sponsors", label: "SPONSORS", isHash: true },
  { href: "/faq", label: "FAQ" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleHashClick = (e: React.MouseEvent<HTMLAnchorElement>, hashTarget: string) => {
    if (location.pathname === "/") {
      e.preventDefault();
      const targetId = hashTarget.replace("/#", "").replace("#", "");
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
        setOpen(false);
      }
    } else {
      setOpen(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "px-2.5 pt-2 sm:px-4 sm:pt-3" : "px-0 pt-0",
      )}
    >
      <nav
        aria-label="Main"
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between gap-2 sm:gap-4 transition-all duration-300",
          scrolled
            ? "glass-panel rounded-lg px-3 py-2 sm:px-5 sm:py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] border-primary/20"
            : "border-b border-border/60 bg-background/80 px-4 py-3 sm:px-8 sm:py-4 backdrop-blur-md",
        )}
      >
        <Link
          to="/"
          className="flex items-center gap-2 sm:gap-2.5 font-display text-sm sm:text-base font-black tracking-widest text-foreground group shrink-0"
          onClick={() => setOpen(false)}
        >
          <img
            src="/favicon-32x32.png"
            alt="APEX Logo"
            className="h-5 w-5 sm:h-6 sm:w-6 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(225,29,72,0.5)]"
          />
          <span className="whitespace-nowrap">
            APEX<span className="text-primary">//</span>1.0
          </span>
        </Link>

        <ul className="mx-auto hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              {item.isHash ? (
                <a
                  href={item.href}
                  onClick={(e) => handleHashClick(e, item.href)}
                  className="relative rounded px-3 py-2 font-mono text-[0.7rem] tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground hover:bg-white/[0.03]"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  to={item.href}
                  className="relative rounded px-3 py-2 font-mono text-[0.7rem] tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground hover:bg-white/[0.03]"
                  activeProps={{ className: "text-foreground font-semibold" }}
                  activeOptions={{ exact: item.href === "/" }}
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && (
                        <span className="absolute inset-x-3 -bottom-1 h-[2px] rounded-full bg-primary shadow-[0_0_8px] shadow-primary/60" />
                      )}
                    </>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 shrink-0">
          <Button asChild size="sm" className="hidden font-mono text-[0.7rem] tracking-[0.16em] bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_-3px] shadow-primary/40 transition-all sm:inline-flex rounded-md min-h-[36px]">
            <Link to="/register">REGISTER NOW &rarr;</Link>
          </Button>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded border border-border text-foreground lg:hidden hover:border-primary/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="mx-auto mt-2 max-w-6xl px-1 lg:hidden">
          <ul className="glass-panel grid gap-1 rounded-xl p-3 shadow-2xl border-primary/25 backdrop-blur-2xl max-h-[calc(100svh-5.5rem)] overflow-y-auto">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                {item.isHash ? (
                  <a
                    href={item.href}
                    onClick={(e) => handleHashClick(e, item.href)}
                    className="block rounded-lg px-3.5 py-3 font-mono text-xs tracking-[0.18em] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3.5 py-3 font-mono text-xs tracking-[0.18em] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    activeProps={{ className: "text-primary font-bold bg-primary/10" }}
                    activeOptions={{ exact: item.href === "/" }}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
            <li className="pt-2">
              <Button asChild className="w-full min-h-[44px] font-mono text-xs tracking-[0.18em] bg-primary text-primary-foreground glow-primary">
                <Link to="/register" onClick={() => setOpen(false)}>
                  REGISTER NOW &rarr;
                </Link>
              </Button>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
