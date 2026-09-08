import { createFileRoute } from "@tanstack/react-router";

import { GamesSection, JokerSection, SuitsSection } from "@/components/sections/borderland-sections";
import { PageHeader } from "@/components/site/page-header";

export const Route = createFileRoute("/games")({
  head: () => ({
    meta: [
      { title: "The Games — BORDER//LAND" },
      {
        name: "description",
        content:
          "Five rounds, four suits, one Joker. Explore every game in the BORDER//LAND hackathon and the abilities each one tests.",
      },
      { property: "og:title", content: "The Games — BORDER//LAND" },
      {
        property: "og:description",
        content: "Five rounds, four suits, one Joker. Every game tests a different ability.",
      },
      { property: "og:url", content: "/games" },
    ],
    links: [{ rel: "canonical", href: "/games" }],
  }),
  component: GamesPage,
});

function GamesPage() {
  return (
    <>
      <PageHeader
        code="SYSTEM_03 / GAME REGISTRY"
        title="Enter the games"
        subtitle="Every game tests a different ability. Clear one and the next begins — harder, stranger, less forgiving."
      />
      <SuitsSection />
      <GamesSection />
      <JokerSection />
    </>
  );
}
