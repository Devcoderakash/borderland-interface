import { Link } from "@tanstack/react-router";
import { Github, Instagram, Linkedin, MessageCircle } from "lucide-react";

const LINKS = [
  { to: "/", label: "Home", isHash: false },
  { to: "/#roadmap", label: "Roadmap", isHash: true },
  { to: "/rules", label: "Rules", isHash: false },
  { to: "/prizes", label: "Prizes", isHash: false },
  { to: "/#sponsors", label: "Sponsors", isHash: true },
  { to: "/faq", label: "FAQ", isHash: false },
  { to: "/register", label: "Register", isHash: false },
] as const;

const SOCIALS = [
  { label: "Instagram", icon: Instagram },
  { label: "LinkedIn", icon: Linkedin },
  { label: "GitHub", icon: Github },
  { label: "Discord", icon: MessageCircle },
];

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border/60 bg-background/95 px-4 pt-10 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] sm:px-8 sm:pt-14 sm:pb-12 overflow-hidden">
      <div className="hair-line absolute top-0 inset-x-0" />
      <div className="mx-auto grid max-w-6xl gap-8 sm:gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
        {/* Brand Block */}
        <div>
          <div className="flex items-center gap-2.5">
            <img
              src="/favicon-32x32.png"
              alt="APEX Logo"
              className="h-6 w-6 object-contain drop-shadow-[0_0_8px_rgba(225,29,72,0.5)]"
            />
            <p className="font-display text-lg font-black tracking-widest text-foreground">
              APEX<span className="text-primary">//</span>1.0
            </p>
          </div>
          <p className="mt-3 font-display text-xs sm:text-sm font-semibold tracking-wider text-muted-foreground">
            ONE IDEA. <span className="text-primary">NO LIMITS.</span>
          </p>
          <p className="mt-3 max-w-xs text-xs text-muted-foreground/80 leading-relaxed">
            A premier national open-innovation hackathon empowering student builders to turn bold ideas into real-world impact.
          </p>
        </div>

        {/* Navigation Links */}
        <nav aria-label="Footer Navigation">
          <p className="font-mono text-[0.65rem] font-semibold tracking-[0.18em] text-primary uppercase">
            NAVIGATION
          </p>
          <ul className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-2">
            {LINKS.map((l) => (
              <li key={l.label}>
                {l.isHash ? (
                  <a
                    href={l.to}
                    className="inline-block text-xs sm:text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link
                    to={l.to}
                    className="inline-block text-xs sm:text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Communication & Contact */}
        <div>
          <p className="font-mono text-[0.65rem] font-semibold tracking-[0.18em] text-primary uppercase">
            COMMUNICATION
          </p>
          <div className="mt-3.5 flex items-center gap-2">
            {SOCIALS.map(({ label, icon: Icon }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="grid h-8 w-8 place-items-center rounded-md border border-border/70 bg-card/30 text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:text-primary hover:shadow-[0_0_12px_-3px_rgba(225,29,72,0.4)]"
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>

          <div className="mt-5 space-y-1 text-xs text-muted-foreground">
            <p>
              <a href="mailto:hello@apex1.dev" className="hover:text-primary transition-colors">
                hello@apex1.dev
              </a>
            </p>
            <p className="text-muted-foreground/70">Bhopal, Madhya Pradesh</p>
          </div>

          <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <span className="text-white/20">·</span>
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="mx-auto mt-8 sm:mt-12 flex max-w-6xl flex-col gap-2 border-t border-border/40 pt-5 sm:flex-row sm:items-center sm:justify-between font-mono text-[0.6rem] sm:text-[0.65rem] tracking-wider text-muted-foreground/60">
        <p>© 2026 APEX 1.0. ALL RIGHTS RESERVED.</p>
        <p className="text-muted-foreground/40">PROTOCOL: APEX · SIGNAL: STABLE</p>
      </div>
    </footer>
  );
}
