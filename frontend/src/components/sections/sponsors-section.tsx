import { useState } from "react";
import { ArrowRight, CheckCircle2, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Reveal, Section, SectionHeading, SystemLabel } from "@/components/site/bits";
import { SPONSOR_TIERS } from "@/shared/data/apex";
import { toast } from "sonner";

export function SponsorsSection() {
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [orgName, setOrgName] = useState("");
  const [partnerType, setPartnerType] = useState("TITLE SPONSOR");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast.success("INQUIRY TRANSMITTED", {
        description: "Our partnership team will get back to you within 24 hours.",
      });
    }, 600);
  };

  return (
    <Section id="sponsors" className="relative">
      <Reveal>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-primary text-xs">◆</span>
            <SystemLabel className="text-primary">SYSTEM 06 / SPONSORS</SystemLabel>
          </div>
          <h2 className="font-display text-3xl font-black uppercase tracking-wider text-foreground sm:text-4xl lg:text-5xl">
            PARTNERS & SUPPORTERS
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed sm:text-base">
            Collaborating with leading organizations to empower student innovation.
          </p>
        </div>
      </Reveal>

      {/* Sponsor Tiers in Minimal Dashed Box Style */}
      <div className="mt-12 space-y-10">
        {SPONSOR_TIERS.map((tierGroup, tierIndex) => (
          <Reveal key={tierGroup.tier} delay={tierIndex * 0.06}>
            <div className="space-y-3.5">
              <p className="font-mono text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                {tierGroup.tier}
              </p>

              <div className="flex flex-wrap gap-2.5 sm:gap-4">
                {Array.from({ length: tierGroup.slots }).map((_, slotIndex) => (
                  <div
                    key={slotIndex}
                    className="group relative flex h-20 w-[calc(50%-0.35rem)] sm:w-40 md:w-44 flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-card/20 px-2.5 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-card/40 hover:shadow-[0_8px_20px_-8px_rgba(225,29,72,0.2)]"
                  >
                    <span className="font-mono text-[0.55rem] sm:text-[0.6rem] tracking-[0.16em] sm:tracking-[0.2em] text-muted-foreground/60 uppercase text-center select-none group-hover:text-muted-foreground transition-colors truncate max-w-full">
                      {tierGroup.tier}
                    </span>
                    <span className="mt-1 font-mono text-xs sm:text-sm font-bold tracking-[0.22em] text-foreground/80 uppercase group-hover:text-primary transition-colors">
                      OPEN
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Become a Partner CTA */}
      <Reveal delay={0.3}>
        <div className="mt-12">
          <Dialog open={partnerDialogOpen} onOpenChange={setPartnerDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="group font-mono text-xs tracking-[0.2em] uppercase border-border/80 bg-background/50 hover:border-primary hover:text-primary transition-all duration-200 h-11 sm:h-10 px-5 w-full sm:w-auto min-h-[44px]"
              >
                BECOME A PARTNER <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </DialogTrigger>

            <DialogContent className="border-border bg-card/95 backdrop-blur-xl sm:max-w-lg">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className="text-primary text-xs">◆</span>
                  <SystemLabel className="text-primary">PARTNERSHIP DECK</SystemLabel>
                </div>
                <DialogTitle className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
                  Partner with APEX 1.0
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Connect with India's top student builders, developers, and designers.
                </DialogDescription>
              </DialogHeader>

              {submitted ? (
                <div className="space-y-4 py-6 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
                  <h4 className="font-display text-lg font-bold text-foreground">
                    INQUIRY RECEIVED
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Thank you for your interest. Our partnership team will contact you with the sponsorship prospectus.
                  </p>
                  <Button
                    variant="outline"
                    className="font-mono text-xs tracking-wider"
                    onClick={() => {
                      setSubmitted(false);
                      setPartnerDialogOpen(false);
                    }}
                  >
                    CLOSE WINDOW
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                        YOUR NAME
                      </label>
                      <input
                        required
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Alex Morgan"
                        className="mt-1 w-full rounded border border-border bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                        WORK EMAIL
                      </label>
                      <input
                        required
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="alex@company.com"
                        className="mt-1 w-full rounded border border-border bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                        ORGANIZATION / COMPANY
                      </label>
                      <input
                        required
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="Acme Corp"
                        className="mt-1 w-full rounded border border-border bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                        TIER INTEREST
                      </label>
                      <select
                        value={partnerType}
                        onChange={(e) => setPartnerType(e.target.value)}
                        className="mt-1 w-full rounded border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                      >
                        <option value="TITLE SPONSOR">TITLE SPONSOR</option>
                        <option value="GOLD PARTNER">GOLD PARTNER</option>
                        <option value="TECH PARTNER">TECH PARTNER</option>
                        <option value="COMMUNITY PARTNER">COMMUNITY PARTNER</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                      MESSAGE / OBJECTIVES
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your developer relations or brand goals..."
                      className="mt-1 w-full rounded border border-border bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <a
                      href="mailto:partners@apex.hackathon"
                      className="inline-flex items-center gap-1.5 font-mono text-[0.7rem] text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5" /> Direct email
                    </a>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="glow-primary font-mono text-xs tracking-[0.18em]"
                    >
                      <Send className="mr-2 h-3.5 w-3.5" />
                      {submitting ? "TRANSMITTING..." : "SUBMIT INQUIRY"}
                    </Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </Reveal>
    </Section>
  );
}
