import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, AlertTriangle, FileCode, Users, Landmark, Scale, ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/site/page-header";
import { Reveal, Section } from "@/components/site/bits";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions — APEX 1.0" },
      {
        name: "description",
        content:
          "Official Terms and Conditions, eligibility requirements, code of conduct, and participation guidelines for APEX 1.0.",
      },
      { property: "og:title", content: "Terms and Conditions — APEX 1.0" },
      {
        property: "og:description",
        content: "Official participation terms, eligibility, and rules for APEX 1.0 Hackathon.",
      },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: TermsPage,
});

const TERMS_LIST = [
  {
    icon: Users,
    code: "TERMS_01",
    title: "Eligibility & Team Composition",
    clauses: [
      "Participation is open to all currently enrolled college and university students (Undergraduate, Postgraduate, Diploma).",
      "Teams must consist of 1 to 4 members. The person initiating registration is designated as the Team Leader.",
      "A student cannot register as a member of more than one team in APEX 1.0.",
      "Valid college ID or proof of enrollment will be verified for teams qualifying for Round 2 offline.",
    ],
  },
  {
    icon: Landmark,
    code: "TERMS_02",
    title: "Registration & Fee Policy",
    clauses: [
      "The Round 1 registration fee is fixed at ₹199 per team (inclusive of processing).",
      "Payment must be completed online via Razorpay at the time of form submission.",
      "Registration fees are strictly non-refundable once an order is verified and confirmed.",
      "Teams are assigned a unique APEX Player ID and Team ID upon successful verification.",
    ],
  },
  {
    icon: FileCode,
    code: "TERMS_03",
    title: "Submissions & Idea Intellectual Property",
    clauses: [
      "Round 1 requires submitting an idea presentation (PPT or PDF file) highlighting the problem statement, proposed architecture, and tech stack.",
      "All submitted work must be original or appropriately credited open source.",
      "Participants retain full intellectual property ownership of their code, design, and product ideas.",
      "Plagiarism, cloning existing commercial apps without meaningful innovation, or falsifying submissions will lead to immediate disqualification.",
    ],
  },
  {
    icon: CheckCircle2,
    code: "TERMS_04",
    title: "Round 2 Offline Finale",
    clauses: [
      "Teams shortlisted from Round 1 will be invited to the offline hackathon build phase in Bhopal, Madhya Pradesh.",
      "Shortlisted teams must confirm physical attendance within the stipulated RSVP window.",
      "Organizers provide power, Wi-Fi, mentorship, and designated hack spaces during the offline event.",
    ],
  },
  {
    icon: AlertTriangle,
    code: "TERMS_05",
    title: "Code of Conduct & Fair Play",
    clauses: [
      "APEX 1.0 maintains a zero-tolerance policy against harassment, hate speech, bullying, or discrimination of any kind.",
      "Use of AI programming assistants (e.g. GitHub Copilot, ChatGPT, Claude) is permitted provided teams clearly understand and defend their implementation.",
      "Judges' decisions regarding shortlisting, scoring, and prizes are final and binding.",
    ],
  },
  {
    icon: Scale,
    code: "TERMS_06",
    title: "Awards, Liability & Jurisdiction",
    clauses: [
      "Prizes will be disbursed to the Team Leader or designated bank account after identity and college verification.",
      "Any tax liabilities arising from cash prizes shall be the responsibility of the recipient teams under applicable laws.",
      "All disputes arising in connection with the event are subject to the exclusive jurisdiction of courts in Bhopal, Madhya Pradesh, India.",
    ],
  },
];

function TermsPage() {
  return (
    <>
      <PageHeader
        code="SYSTEM_07 / TERMS"
        title="Terms & Conditions"
        subtitle="Official rules of engagement and contractual guidelines for all APEX 1.0 participants."
      />

      <Section>
        <Reveal>
          <div className="mx-auto max-w-4xl">
            <div className="glass-panel mb-10 rounded-xl p-6 sm:p-8 border-primary/30">
              <div className="flex items-center gap-2 text-primary font-mono text-xs tracking-widest uppercase">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                BINDING AGREEMENT · APEX 1.0 NATIONAL HACKATHON
              </div>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                By registering for APEX 1.0, submitting ideas, or participating in the offline rounds, you and your
                team members explicitly agree to be bound by the following terms, conditions, and official event rules.
              </p>
            </div>

            <div className="space-y-6">
              {TERMS_LIST.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Reveal key={item.code} delay={i * 0.05}>
                    <div className="glass-panel relative overflow-hidden rounded-xl p-6 sm:p-8 transition-all hover:border-primary/40">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="font-mono text-[0.65rem] tracking-[0.2em] text-primary">
                            {item.code}
                          </span>
                          <h2 className="font-display text-lg sm:text-xl font-bold tracking-wider">
                            {item.title}
                          </h2>
                        </div>
                      </div>

                      <ul className="mt-5 space-y-3">
                        {item.clauses.map((clause, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 text-xs sm:text-sm text-muted-foreground leading-relaxed"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                            <span>{clause}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-border/60 bg-card/40 p-6">
              <div>
                <p className="font-display text-sm font-bold tracking-wider">READY TO REGISTER?</p>
                <p className="text-xs text-muted-foreground">Ensure your team meets all criteria before submitting.</p>
              </div>
              <Button asChild className="glow-primary font-mono text-xs tracking-widest">
                <Link to="/register">
                  PROCEED TO REGISTER <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
