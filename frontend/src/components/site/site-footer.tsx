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
    <footer className="relative border-t border-border/80 bg-background px-4 py-10 sm:px-8 sm:py-14 overflow-hidden">
      <div className="hair-line absolute top-0 inset-x-0" />
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
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
            <span className="text-primary font-bold">NO LIMITS.</span>
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="system-label">NAVIGATION</p>
          <ul className="mt-4 grid grid-cols-2 gap-2">
            {LINKS.map((l) => (
              <li key={l.label}>
                {l.isHash ? (
                  <a
                    href={l.to}
                    className="inline-block text-sm text-muted-foreground transition-all duration-200 hover:text-foreground hover:translate-x-0.5"
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link
                    to={l.to}
                    className="inline-block text-sm text-muted-foreground transition-all duration-200 hover:text-foreground hover:translate-x-0.5"
                  >
                    {l.label}
                  </Link>
                )}
              </li>
            ))}
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
                className="grid h-9 w-9 place-items-center rounded-md border border-border/80 bg-card/40 text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:text-primary hover:shadow-[0_0_15px_-3px_rgba(225,29,72,0.4)]"
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
