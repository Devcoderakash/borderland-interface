import { Link } from "@tanstack/react-router";
import { Github, Instagram, Linkedin, MessageCircle } from "lucide-react";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/rules", label: "Rules" },
  { to: "/prizes", label: "Prizes" },
  { to: "/faq", label: "FAQ" },
  { to: "/register", label: "Register" },
] as const;

const SOCIALS = [
  { label: "Instagram", icon: Instagram },
  { label: "LinkedIn", icon: Linkedin },
  { label: "GitHub", icon: Github },
  { label: "Discord", icon: MessageCircle },
];

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border/70 bg-background px-5 py-14 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <img
              src="/favicon-32x32.png"
              alt="APEX Logo"
              className="h-6 w-6 object-contain drop-shadow-[0_0_8px_rgba(225,29,72,0.5)]"
            />
            <p className="font-display text-lg font-black tracking-widest">
              APEX<span className="text-primary">//</span>1.0
            </p>
          </div>
          <p className="mt-4 font-display text-sm leading-7 tracking-[0.3em] text-muted-foreground">
            ONE IDEA.
            <br />
            24 HOURS.
            <br />
            NO LIMITS.
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="system-label">NAVIGATION</p>
          <ul className="mt-4 grid grid-cols-2 gap-2">
            {LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href="/#roadmap"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Roadmap
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <p className="system-label">COMMUNICATION</p>
          <div className="mt-4 flex gap-2">
            {SOCIALS.map(({ label, icon: Icon }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded border border-border text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            hello@apex1.dev
            <br />
            Bhopal, Madhya Pradesh
          </p>
          <ul className="mt-4 flex gap-4 text-xs text-muted-foreground">
            <li>
              <a href="#" className="hover:text-foreground">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground">
                Terms
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-2 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="system-label">© 2026 APEX 1.0. ALL RIGHTS RESERVED.</p>
        <p className="system-label">PROTOCOL: APEX · SIGNAL: STABLE</p>
      </div>
    </footer>
  );
}
