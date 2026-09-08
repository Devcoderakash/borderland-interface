import { createFileRoute } from "@tanstack/react-router";

import {
  FaqSection,
  FinalCta,
  GamesSection,
  Hero,
  JokerSection,
  OrganizersSection,
  PrizesSection,
  RulesSection,
  SponsorsSection,
  SuitsSection,
  TimelineSection,
  VenueSection,
  WelcomeSection,
} from "@/components/sections/borderland-sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BORDER//LAND — Where Code Meets Survival" },
      {
        name: "description",
        content:
          "BORDER//LAND is a high-stakes technology hackathon combining AI, coding, strategy, creativity and teamwork. Choose your suit, form your team, survive the games.",
      },
      { property: "og:title", content: "BORDER//LAND — Where Code Meets Survival" },
      {
        property: "og:description",
        content:
          "A high-stakes technology hackathon where intelligence, creativity, teamwork and strategy determine who survives.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <WelcomeSection />
      <SuitsSection />
      <GamesSection />
      <JokerSection />
      <RulesSection />
      <TimelineSection />
      <PrizesSection />
      <SponsorsSection />
      <OrganizersSection />
      <VenueSection />
      <FaqSection />
      <FinalCta />
    </>
  );
}
