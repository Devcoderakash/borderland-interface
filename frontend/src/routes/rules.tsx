import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";

import { RulesSection } from "@/components/sections/apex-sections";
import { PageHeader } from "@/components/site/page-header";
import { Reveal, Section, SectionHeading } from "@/components/site/bits";
import { EVALUATION_CRITERIA } from "@/lib/apex";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rules")({
  head: () => ({
    meta: [
      { title: "The Rules — APEX 1.0" },
      {
        name: "description",
        content:
          "Team size, originality, permitted technology, AI usage, fair play and judging criteria for the APEX 1.0 hackathon.",
      },
      { property: "og:title", content: "The Rules — APEX 1.0" },
      {
        property: "og:description",
        content: "Official guidelines, protocols, and evaluation criteria for APEX 1.0.",
      },
      { property: "og:url", content: "/rules" },
    ],
    links: [{ rel: "canonical", href: "/rules" }],
  }),
  component: RulesPage,
});

function RulesPage() {
  return (
    <>
      <PageHeader
        code="SYSTEM 04 / PROTOCOL"
        title="Understand the rules"
        subtitle="Official guidelines and evaluation criteria for all APEX 1.0 participants."
      />
      <RulesSection />
      <Section>
        <Reveal>
          <SectionHeading code="PROTOCOL / SCORING" title="How judging works" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {EVALUATION_CRITERIA.map((j, i) => (
              <div key={j.id} className={cn("glass-panel relative overflow-hidden rounded-xl p-6", j.borderClass)}>
                {/* Faint background number */}
                <span
                  className="pointer-events-none absolute -right-2 -top-4 select-none font-display text-[7rem] font-black leading-none text-foreground/[0.03]"
                  aria-hidden
                >
                  {j.id}
                </span>
                <div className="relative">
                  <p className={cn("font-display text-3xl font-black", j.colorClass)}>{j.weightage}</p>
                  <p className="mt-2 system-label">{j.name}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{j.subtitle}</p>
                  {/* Animated progress bar */}
                  <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-border/40">
                    <motion.div
                      className={cn("h-full rounded-full", j.bgClass.replace("/10", "/60"))}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${j.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-2xl text-sm text-muted-foreground">
            Projects are evaluated by an expert judging panel across all four criteria. Ensure all submissions
            adhere to originality, fair play, and event guidelines.
          </p>
        </Reveal>
      </Section>
    </>
  );
}
