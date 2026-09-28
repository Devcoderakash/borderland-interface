import { createFileRoute } from "@tanstack/react-router";

import {
  FaqSection,
  FinalCta,
  RoadmapSection,
  Hero,
  OrganizersSection,
  PrizesSection,
  RulesSection,
  SponsorsSection,
  JudgingSection,
  VenueSection,
  WelcomeSection,
} from "@/components/sections/apex-sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "APEX 1.0 — One Idea. 24 Hours. No Limits." },
      {
        name: "description",
        content:
          "APEX 1.0 is a premier open-innovation hackathon where students build, innovate, pitch, and compete to create impactful solutions.",
      },
      { property: "og:title", content: "APEX 1.0 — One Idea. 24 Hours. No Limits." },
      {
        property: "og:description",
        content:
          "A premier open-innovation hackathon where students build, innovate, pitch, and compete over two rounds.",
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
      <JudgingSection />
      <RoadmapSection />
      <RulesSection />
      <PrizesSection />
      <SponsorsSection />
      <OrganizersSection />
      <VenueSection />
      <FaqSection />
      <FinalCta />
    </>
  );
}
