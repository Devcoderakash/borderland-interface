import { createFileRoute } from "@tanstack/react-router";

import { RulesSection } from "@/components/sections/borderland-sections";
import { PageHeader } from "@/components/site/page-header";
import { Reveal, Section, SectionHeading } from "@/components/site/bits";

const JUDGING = [
  { k: "INNOVATION", v: "30%" },
  { k: "TECHNICAL QUALITY", v: "30%" },
  { k: "IMPACT", v: "20%" },
  { k: "PRESENTATION", v: "20%" },
];

export const Route = createFileRoute("/rules")({
  head: () => ({
    meta: [
      { title: "The Rules — BORDER//LAND" },
      {
        name: "description",
        content:
          "Team size, originality, permitted technology, AI usage, fair play and judging criteria for the BORDER//LAND hackathon.",
      },
      { property: "og:title", content: "The Rules — BORDER//LAND" },
      {
        property: "og:description",
        content: "Seven protocols govern the Borderland. Breaking one ends your run.",
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
        code="SYSTEM_04 / PROTOCOL"
        title="Understand the rules"
        subtitle="Read them once. The games will not repeat them."
      />
      <RulesSection />
      <Section>
        <Reveal>
          <SectionHeading code="PROTOCOL / SCORING" title="How judging works" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {JUDGING.map((j) => (
              <div key={j.k} className="glass-panel rounded-xl p-6">
                <p className="font-display text-3xl font-black text-primary">{j.v}</p>
                <p className="mt-2 system-label">{j.k}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-2xl text-sm text-muted-foreground">
            Scores are recorded per game and aggregated on the public leaderboard. Any protocol
            violation results in immediate elimination — the Borderland does not issue warnings.
          </p>
        </Reveal>
      </Section>
    </>
  );
}
