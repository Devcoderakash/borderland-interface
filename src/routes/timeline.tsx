import { createFileRoute } from "@tanstack/react-router";

import { TimelineSection, VenueSection } from "@/components/sections/borderland-sections";
import { PageHeader } from "@/components/site/page-header";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Timeline — BORDER//LAND" },
      {
        name: "description",
        content:
          "Hour-by-hour schedule for the two days of BORDER//LAND, from registration to the Joker round and results.",
      },
      { property: "og:title", content: "Timeline — BORDER//LAND" },
      { property: "og:description", content: "Two days. Five games. One survivor." },
      { property: "og:url", content: "/timeline" },
    ],
    links: [{ rel: "canonical", href: "/timeline" }],
  }),
  component: TimelinePage,
});

function TimelinePage() {
  return (
    <>
      <PageHeader
        code="SYSTEM_05 / SCHEDULE"
        title="Survive the rounds"
        subtitle="Every hour of the Borderland is accounted for. Miss a checkpoint and your run ends there."
      />
      <TimelineSection />
      <VenueSection />
    </>
  );
}
