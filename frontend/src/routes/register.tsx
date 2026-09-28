import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Github,
  Linkedin,
  Loader2,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Reveal, Section, SystemLabel } from "@/components/site/bits";
import { PageHeader } from "@/components/site/page-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { load } from "@cashfreepayments/cashfree-js";
import { createOrder, verifyPayment } from "@/lib/api";

const schema = z.object({
  team_name: z.string().trim().min(2, "Team name is required").max(80),
  leader_name: z.string().trim().min(2, "Leader name is required").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
  college: z.string().trim().min(2, "College or organization is required").max(120),
  team_size: z.enum(["2", "3", "4"]),
  member1: z.string().trim().min(2, "At least two members are required").max(80),
  member2: z.string().trim().max(80).optional().or(z.literal("")),
  member3: z.string().trim().max(80).optional().or(z.literal("")),
  member4: z.string().trim().max(80).optional().or(z.literal("")),
  preferred_domain: z.string().trim().max(120).optional().or(z.literal("")),
  github_url: z.string().trim().url("Enter a valid URL").max(255).optional().or(z.literal("")),
  linkedin_url: z.string().trim().url("Enter a valid URL").max(255).optional().or(z.literal("")),
  ppt_url: z.string().trim().url("Enter a valid PPT URL").max(500),
  terms: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
});

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — APEX 1.0" },
      {
        name: "description",
        content:
          "Register your team of 2–4 members for APEX 1.0 and submit your idea.",
      },
      { property: "og:title", content: "Register — APEX 1.0" },
      { property: "og:description", content: "Form your team. Submit your idea. Pitch to win." },
      { property: "og:url", content: "/register" },
    ],
    links: [{ rel: "canonical", href: "/register" }],
  }),
  component: RegisterPage,
});

/* ─── static info shown in the sidebar ─── */
const CHECKLIST = [
  { icon: Users, text: "Form a team of 2 – 4 members" },
  { icon: FileText, text: "Prepare your idea PPT (Google Drive, public link)" },
  { icon: Zap, text: "Pay ₹150 entry fee per team (Round 1)" },
  { icon: Trophy, text: "Build, pitch & win from a ₹90,000+ prize pool" },
  { icon: Clock, text: "24-hour open-innovation format" },
];

const QUICK_FACTS = [
  { label: "FORMAT", value: "Open Innovation" },
  { label: "DURATION", value: "24 Hours" },
  { label: "TEAM SIZE", value: "2 – 4 Members" },
  { label: "PRIZE POOL", value: "₹90,000+" },
  { label: "ROUND 1 FEE", value: "₹150 / team" },
  { label: "VENUE", value: "Tech Convention Centre, Bhopal" },
];

const FORM_STEPS = [
  { id: "01", label: "Team" },
  { id: "02", label: "Members" },
  { id: "03", label: "Profile" },
  { id: "04", label: "Submission" },
];

/* ─── Page ─── */
function RegisterPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      team_name: "",
      leader_name: "",
      email: "",
      phone: "",
      college: "",
      team_size: "2",
      member1: "",
      member2: "",
      member3: "",
      member4: "",
      preferred_domain: "",
      github_url: "",
      linkedin_url: "",
      ppt_url: "",
      terms: false as unknown as true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);

    try {
      const members = [values.member1, values.member2, values.member3, values.member4]
        .map((m, i) => ({ full_name: (m ?? "").trim(), position: i + 1 }))
        .filter((m) => m.full_name.length > 1);

      // 1. Create server-side order with Cashfree
      const orderData = await createOrder({
        team_name: values.team_name,
        leader_name: values.leader_name,
        email: values.email,
        phone: values.phone,
        college: values.college,
        team_size: Number(values.team_size),
        ppt_url: values.ppt_url,
        ...(values.preferred_domain !== undefined && { preferred_domain: values.preferred_domain }),
        ...(values.github_url !== undefined && { github_url: values.github_url }),
        ...(values.linkedin_url !== undefined && { linkedin_url: values.linkedin_url }),
        members,
      });

      // 2. Open Cashfree Checkout if session ID is returned
      if (orderData.paymentSessionId) {
        const cashfree = await load({
          mode: orderData.environment || "sandbox",
        });

        if (!cashfree) {
          throw new Error("Unable to initialize Cashfree SDK.");
        }

        toast.loading("Connecting to Cashfree...", { id: "cashfree_checkout" });

        cashfree
          .checkout({
            paymentSessionId: orderData.paymentSessionId,
            redirectTarget: "_modal",
          })
          .then(async (result: any) => {
            toast.dismiss("cashfree_checkout");

            if (result.error) {
              toast.error("PAYMENT NOT COMPLETED", {
                description: result.error.message || "Payment was cancelled or failed.",
              });
              setSubmitting(false);
              return;
            }

            if (result.paymentDetails) {
              toast.loading("Verifying payment...", { id: "payment_verify" });
              try {
                const verifyRes = await verifyPayment({
                  orderId: orderData.orderId,
                  referenceId: orderData.referenceId,
                });

                if (verifyRes.success) {
                  toast.success("PAYMENT CONFIRMED", {
                    id: "payment_verify",
                    description: `Team ID ${orderData.playerId} confirmed!`,
                  });
                } else {
                  toast.warning("PAYMENT PROCESSING", {
                    id: "payment_verify",
                    description: "Your payment is being confirmed.",
                  });
                }

                navigate({
                  to: "/success",
                  search: {
                    pid: orderData.playerId,
                    team: values.team_name,
                    order_id: orderData.orderId,
                  },
                });
              } catch (verifyErr) {
                console.error("[Verify Error]", verifyErr);
                navigate({
                  to: "/success",
                  search: {
                    pid: orderData.playerId,
                    team: values.team_name,
                    order_id: orderData.orderId,
                  },
                });
              }
            }
          });
      } else {
        // Fallback for simulation / direct record
        toast.success("REGISTRATION RECORDED", {
          description: `Team ID ${orderData.playerId} reserved.`,
        });
        navigate({
          to: "/success",
          search: {
            pid: orderData.playerId,
            team: values.team_name,
            order_id: orderData.orderId,
          },
        });
      }
    } catch (err: any) {
      console.error("[Registration error]", err);

      // TanStack Start / h3 may return the HTML error page as err.message
      // when the server function crashes — detect and strip it.
      const rawMessage: string = err?.message || err?.data?.message || String(err ?? "");
      const isHtmlError = rawMessage.trimStart().startsWith("<!") || rawMessage.trimStart().startsWith("<html");

      let friendlyMessage: string;
      if (isHtmlError) {
        friendlyMessage = "Server error. Check your .env credentials (Supabase & Cashfree) and try again.";
      } else if (rawMessage.toLowerCase().includes("cashfree")) {
        friendlyMessage = rawMessage;
      } else if (rawMessage.toLowerCase().includes("supabase") || rawMessage.toLowerCase().includes("duplicate")) {
        friendlyMessage = "This email or team is already registered. Please use a different email.";
      } else {
        friendlyMessage = rawMessage || "Submission failed. Please check your details and try again.";
      }

      toast.error("REGISTRATION FAILED", { description: friendlyMessage });
      setSubmitting(false);
    }
  };

  const size = Number(form.watch("team_size"));
  const terms = form.watch("terms");

  return (
    <>
      <PageHeader
        code="SYSTEM_12 / ENTRY"
        title="Register your team"
        subtitle="Form your 2–4 member team and submit your idea PPT link. ₹150 entry fee applies for Round 1."
      />

      <Section>
        <Reveal>
          {/* ── two-column layout ── */}
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">

            {/* ── LEFT: Info sidebar ── */}
            <aside className="flex flex-col gap-6">

              {/* Registrations open badge */}
              <div className="glass-panel rounded-xl p-5 border border-primary/30">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                  <SystemLabel className="text-primary">REGISTRATIONS: OPEN</SystemLabel>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Secure your spot at APEX 1.0 — the 24-hour open-innovation hackathon.
                  Registrations are live and slots are limited.
                </p>
              </div>

              {/* Quick facts grid */}
              <div className="glass-panel rounded-xl p-5">
                <SystemLabel className="mb-4 text-primary">EVENT DETAILS</SystemLabel>
                <div className="grid grid-cols-2 gap-3">
                  {QUICK_FACTS.map((f) => (
                    <div key={f.label} className="rounded-lg border border-border/40 bg-muted/20 p-3">
                      <p className="font-mono text-[0.6rem] tracking-[0.15em] text-muted-foreground">
                        {f.label}
                      </p>
                      <p className="mt-1 font-mono text-xs font-semibold text-foreground">
                        {f.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checklist */}
              <div className="glass-panel rounded-xl p-5">
                <SystemLabel className="mb-4 text-primary">BEFORE YOU REGISTER</SystemLabel>
                <ul className="space-y-3">
                  {CHECKLIST.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social links reminder */}
              <div className="glass-panel rounded-xl p-5">
                <SystemLabel className="mb-3 text-primary">OPTIONAL BUT RECOMMENDED</SystemLabel>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Github className="h-4 w-4 text-primary/70" />
                    Add your GitHub to showcase prior work
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Linkedin className="h-4 w-4 text-primary/70" />
                    Add LinkedIn for post-event networking
                  </div>
                </div>
              </div>

              {/* Fee callout */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <div>
                    <p className="font-mono text-xs font-semibold tracking-widest text-amber-400">
                      ENTRY FEE — ₹150
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Payment details will be shared via email after your registration is
                      confirmed. Your slot is reserved only after payment.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* ── RIGHT: Registration form ── */}
            <div>
              {/* Steps indicator */}
              <div className="mb-6 flex items-center gap-0">
                {FORM_STEPS.map((step, i) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/60 bg-primary/10">
                        <span className="font-mono text-[0.6rem] text-primary">{step.id}</span>
                      </div>
                      <span className="mt-1 font-mono text-[0.55rem] tracking-widest text-muted-foreground">
                        {step.label.toUpperCase()}
                      </span>
                    </div>
                    {i < FORM_STEPS.length - 1 && (
                      <div className="mb-4 mx-2 h-px w-10 bg-border/50 sm:w-16" />
                    )}
                  </div>
                ))}
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="glass-panel grid gap-8 rounded-xl p-6 sm:p-8"
                  noValidate
                >
                  {/* SECTION 01 – TEAM */}
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <SystemLabel className="text-primary">SECTION_01 / TEAM</SystemLabel>
                      <div className="h-px flex-1 bg-border/40" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field form={form} name="team_name" label="TEAM NAME" />
                      <Field form={form} name="leader_name" label="TEAM LEADER NAME" />
                      <Field form={form} name="email" label="EMAIL" type="email" />
                      <Field form={form} name="phone" label="PHONE" />
                      <Field form={form} name="college" label="COLLEGE / ORGANIZATION" />
                      <FormField
                        control={form.control}
                        name="team_size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="system-label">TEAM SIZE</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {["2", "3", "4"].map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s} MEMBERS
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* SECTION 02 – MEMBERS */}
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <SystemLabel className="text-primary">SECTION_02 / MEMBERS</SystemLabel>
                      <div className="h-px flex-1 bg-border/40" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field form={form} name="member1" label="MEMBER 1" />
                      <Field form={form} name="member2" label="MEMBER 2" />
                      {size >= 3 ? <Field form={form} name="member3" label="MEMBER 3" /> : null}
                      {size >= 4 ? <Field form={form} name="member4" label="MEMBER 4" /> : null}
                    </div>
                    <p className="mt-3 font-mono text-[0.65rem] tracking-widest text-muted-foreground/60">
                      ↑ MEMBER SLOTS ADJUST BASED ON SELECTED TEAM SIZE
                    </p>
                  </div>

                  {/* SECTION 03 – PROFILE */}
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <SystemLabel className="text-primary">SECTION_03 / PROFILE</SystemLabel>
                      <div className="h-px flex-1 bg-border/40" />
                      <span className="font-mono text-[0.6rem] tracking-widest text-muted-foreground">
                        OPTIONAL
                      </span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field form={form} name="preferred_domain" label="PREFERRED DOMAIN" />
                      <Field form={form} name="github_url" label="GITHUB" placeholder="https://github.com/..." />
                      <Field form={form} name="linkedin_url" label="LINKEDIN" placeholder="https://linkedin.com/..." />
                    </div>
                  </div>

                  {/* SECTION 04 – IDEA SUBMISSION */}
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <SystemLabel className="text-primary">SECTION_04 / IDEA SUBMISSION</SystemLabel>
                      <div className="h-px flex-1 bg-border/40" />
                    </div>
                    <Field
                      form={form}
                      name="ppt_url"
                      label="PPT DRIVE LINK (PUBLIC)"
                      placeholder="https://drive.google.com/..."
                    />
                    <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                      Upload your idea presentation to Google Drive and paste the public
                      shareable link above. Ensure the link is accessible without sign-in.
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-border/40" />

                  {/* Terms */}
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={terms === true}
                      onCheckedChange={(v) =>
                        form.setValue("terms", (v === true) as true, { shouldValidate: true })
                      }
                      aria-label="Accept terms and conditions"
                    />
                    <div>
                      <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                        I accept the{" "}
                        <a href="/rules" className="text-primary underline underline-offset-2 hover:text-primary/80">
                          APEX 1.0 rules
                        </a>
                        , guidelines, and judging terms.
                      </label>
                      {form.formState.errors.terms ? (
                        <p className="mt-1 font-mono text-[0.7rem] text-destructive">
                          {form.formState.errors.terms.message}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-mono text-[0.65rem] tracking-widest text-muted-foreground/70">
                      ALL FIELDS MARKED ARE REQUIRED · REVIEW BEFORE SUBMITTING
                    </p>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={submitting}
                      className="glow-primary font-mono text-xs tracking-[0.2em] shrink-0"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> TRANSMITTING…
                        </>
                      ) : (
                        "REGISTER MY TEAM →"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}

function Field({
  form,
  name,
  label,
  type = "text",
  placeholder,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
  name: keyof FormValues;
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="system-label">{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              value={typeof field.value === "string" ? field.value : ""}
              type={type}
              placeholder={placeholder}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
