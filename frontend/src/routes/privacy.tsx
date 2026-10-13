import { createFileRoute } from "@tanstack/react-router";
import { Shield, Lock, FileText, Database, CreditCard, Mail } from "lucide-react";

import { PageHeader } from "@/components/site/page-header";
import { Reveal, Section, SectionHeading } from "@/components/site/bits";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — APEX 1.0" },
      {
        name: "description",
        content:
          "Official Privacy Policy for APEX 1.0 National Hackathon. Learn how participant data, project files, and payment info are protected.",
      },
      { property: "og:title", content: "Privacy Policy — APEX 1.0" },
      {
        property: "og:description",
        content: "Data protection and privacy guidelines for APEX 1.0 participants.",
      },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

const SECTIONS = [
  {
    icon: Shield,
    code: "SEC_01",
    title: "Information We Collect",
    content: [
      "Registration Details: When registering a team, we collect the Team Leader's name, email, contact phone number, college/institution, and optional GitHub/LinkedIn profiles.",
      "Team Member Details: Names and designated positions of 1 to 3 additional team members (total team size 1–4).",
      "Submissions & Documents: PPT and PDF presentations uploaded during registration or subsequent rounds, stored securely in Supabase Storage.",
      "Technical & Usage Data: Basic device, browser, and access timestamps for diagnostic and security audits.",
    ],
  },
  {
    icon: Database,
    code: "SEC_02",
    title: "How We Use Your Information",
    content: [
      "Hackathon Administration: To create your unique Team ID / Player ID, verify registration validity, and organize round evaluations.",
      "Judging & Shortlisting: Your submitted presentation slides and project metadata are shared strictly with verified judges and mentors.",
      "Communication & Alerts: We send registration confirmations, payment receipts, shortlisting announcements, and offline round schedules via email or WhatsApp/SMS.",
      "Prize Distribution: Contact and bank/UPI verification for winning teams to receive awards and certificates.",
    ],
  },
  {
    icon: CreditCard,
    code: "SEC_03",
    title: "Payment Information & Razorpay",
    content: [
      "The Round 1 registration fee of ₹199 per team is processed through Razorpay, a PCI-DSS compliant secure payment gateway.",
      "APEX 1.0 and its servers do NOT capture, store, or process your credit/debit card numbers, CVVs, net banking passwords, or UPI PINs.",
      "We only receive and store transaction references (Razorpay Order ID, Payment ID, Signature) to confirm payment status.",
    ],
  },
  {
    icon: Lock,
    code: "SEC_04",
    title: "Data Storage & Security",
    content: [
      "All registration data is stored in encrypted Supabase cloud databases with role-based access control (RLS).",
      "Uploaded presentations are stored in isolated cloud storage buckets with secure URL generation.",
      "Administrative access is restricted to authorized hackathon organizing committee members via authenticated portals.",
    ],
  },
  {
    icon: FileText,
    code: "SEC_05",
    title: "Intellectual Property & Submissions",
    content: [
      "Participants retain 100% intellectual property ownership of their ideas, presentations, and code.",
      "By submitting, you grant APEX 1.0 organizers permission to evaluate your entry and showcase non-confidential project highlights during event coverage and social media broadcasts.",
    ],
  },
  {
    icon: Mail,
    code: "SEC_06",
    title: "Contact & Data Inquiries",
    content: [
      "If you wish to update your team details, withdraw your registration, or request data deletion, contact our privacy desk at hello@apex1.dev.",
      "Physical Office: Tech Convention Centre, Bhopal, Madhya Pradesh, India.",
    ],
  },
];

function PrivacyPage() {
  return (
    <>
      <PageHeader
        code="SYSTEM_08 / PRIVACY"
        title="Privacy Policy"
        subtitle="How APEX 1.0 handles, protects, and respects your team and submission data."
      />

      <Section>
        <Reveal>
          <div className="mx-auto max-w-4xl">
            <div className="glass-panel mb-10 rounded-xl p-6 sm:p-8 border-primary/30">
              <div className="flex items-center gap-2 text-primary font-mono text-xs tracking-widest uppercase">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                EFFECTIVE DATE: OCTOBER 2026 · APEX 1.0 PROTOCOL
              </div>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                APEX 1.0 ("we", "our", or "the Hackathon") is committed to protecting the privacy and security of
                all participants, mentors, and sponsors. This document describes our practices regarding the
                collection, usage, and safeguarding of participant information.
              </p>
            </div>

            <div className="space-y-6">
              {SECTIONS.map((sec, i) => {
                const Icon = sec.icon;
                return (
                  <Reveal key={sec.code} delay={i * 0.05}>
                    <div className="glass-panel relative overflow-hidden rounded-xl p-6 sm:p-8 transition-all hover:border-primary/40">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="font-mono text-[0.65rem] tracking-[0.2em] text-primary">
                            {sec.code}
                          </span>
                          <h2 className="font-display text-lg sm:text-xl font-bold tracking-wider">
                            {sec.title}
                          </h2>
                        </div>
                      </div>

                      <ul className="mt-5 space-y-3">
                        {sec.content.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 text-xs sm:text-sm text-muted-foreground leading-relaxed"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            <div className="mt-10 rounded-xl border border-border/60 bg-card/40 p-6 text-center">
              <p className="text-xs font-mono tracking-widest text-muted-foreground">
                QUESTIONS REGARDING PRIVACY? REACH OUT TO{" "}
                <a href="mailto:hello@apex1.dev" className="text-primary underline hover:text-primary/80">
                  HELLO@APEX1.DEV
                </a>
              </p>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
