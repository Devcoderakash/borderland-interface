import { createFileRoute } from "@tanstack/react-router";

import { PrizesSection, SponsorsSection } from "@/components/sections/borderland-sections";
import { PageHeader } from "@/components/site/page-header";

export const Route = createFileRoute("/prizes")({
  head: () => ({
    meta: [
      { title: "Prizes — BORDER//LAND" },
      {
        name: "description",
        content:
          "A ₹90,000 prize pool plus six special awards, including Joker Champion and Best Beginner Team.",
      },
      { property: "og:title", content: "Prizes — BORDER//LAND" },
      { property: "og:description", content: "Claim the title. ₹90,000 pool and six special awards." },
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
        code="SYSTEM_06 / REWARD"
        title="Claim the title"
        subtitle="Not everyone reaches the final. The ones who do leave with more than money."
      />
      <PrizesSection />
      <SponsorsSection />
    </>
  );
}
