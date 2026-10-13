import { createFileRoute } from "@tanstack/react-router";

import { PrizesSection, SponsorsSection } from "@/components/sections/apex-sections";
import { PageHeader } from "@/components/site/page-header";

export const Route = createFileRoute("/prizes")({
  head: () => ({
    meta: [
      { title: "Prizes — APEX 1.0" },
      {
        name: "description",
        content:
          "A ₹30,000 prize pool plus six special achievement awards at APEX 1.0.",
      },
      { property: "og:title", content: "Prizes — APEX 1.0" },
      { property: "og:description", content: "Compete for a ₹30,000 prize pool and special track awards." },
      { property: "og:url", content: "/prizes" },
    ],
    links: [{ rel: "canonical", href: "/prizes" }],
  }),
  component: PrizesPage,
});

function PrizesPage() {
  return (
    <>
      <PageHeader
        code="SYSTEM_05 / REWARDS"
        title="Prizes & Recognition"
        subtitle="Rewarding outstanding innovations, technical depth, social impact, and design excellence."
      />
      <PrizesSection />
      <SponsorsSection />
    </>
  );
}
