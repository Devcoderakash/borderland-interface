import { createFileRoute } from "@tanstack/react-router";

import { FaqSection, FinalCta, OrganizersSection } from "@/components/sections/apex-sections";
import { PageHeader } from "@/components/site/page-header";
import { FAQS } from "@/lib/apex";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — APEX 1.0" },
      {
        name: "description",
        content:
          "Answers about eligibility, team size, AI tools, technologies, rounds, and judging at APEX 1.0.",
      },
      { property: "og:title", content: "FAQ — APEX 1.0" },
      { property: "og:description", content: "Frequently asked questions about APEX 1.0." },
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
        code="SYSTEM_09 / QUERY"
        title="Frequently Asked Questions"
        subtitle="Key information regarding eligibility, team structure, rounds, and judging."
      />
      <FaqSection />
      <OrganizersSection />
      <FinalCta />
    </>
  );
}
