import { createFileRoute } from "@tanstack/react-router";

import { FaqSection, FinalCta, OrganizersSection } from "@/components/sections/borderland-sections";
import { PageHeader } from "@/components/site/page-header";
import { FAQS } from "@/lib/borderland";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — BORDER//LAND" },
      {
        name: "description",
        content:
          "Answers about eligibility, team size, AI tools, technologies, judging and the Joker round at BORDER//LAND.",
      },
      { property: "og:title", content: "FAQ — BORDER//LAND" },
      { property: "og:description", content: "Ask before you enter." },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <PageHeader
        code="SYSTEM_10 / QUERY"
        title="Questions"
        subtitle="Everything you can know before the games begin."
      />
      <FaqSection />
      <OrganizersSection />
      <FinalCta />
    </>
  );
}
