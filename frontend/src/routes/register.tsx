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
import { loadRazorpayScript } from "@/lib/razorpay";
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
          "Register your team of 1–4 members for APEX 1.0 and submit your idea.",
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
  { icon: Users, text: "Form a team of 1 – 4 members" },
  { icon: FileText, text: "Prepare your idea PPT (Google Drive, public link)" },
  { icon: Zap, text: "Pay ₹199 entry fee per team (Round 1)" },
  { icon: Trophy, text: "Build, pitch & win from a ₹30,000 prize pool" },
  { icon: Sparkles, text: "National open-innovation hackathon format" },
];

const QUICK_FACTS = [
  { label: "FORMAT", value: "Open Innovation" },
  { label: "STRUCTURE", value: "2 Rounds (Online + Offline)" },
  { label: "TEAM SIZE", value: "1 – 4 Members" },
  { label: "PRIZE POOL", value: "₹30,000" },
  { label: "ROUND 1 FEE", value: "₹199 / team" },
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

      toast.loading("Initiating registration order...", { id: "order_create" });

      // 1. Create server-side order with Razorpay
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

      toast.dismiss("order_create");

      // 2. Load official Razorpay Checkout SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay payment SDK. Please check your internet connection.");
      }

      const keyId = orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!keyId || !window.Razorpay) {
        // Fallback simulation if no test key configured yet
        console.warn("[Razorpay] Missing keyId or SDK. Simulating registration pass-through for testing.");
        toast.info("DEVELOPMENT MODE", {
          description: "Razorpay Test Key not configured yet. Simulating registration confirmation.",
        });

        const verifyRes = await verifyPayment({
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: "mock_signature_dev",
          teamId: orderData.teamId,
        });

        navigate({
          to: "/success",
          search: {
            pid: orderData.playerId,
            team: values.team_name,
            order_id: orderData.orderId,
          },
        });
        return;
      }

      toast.loading("Opening Razorpay Checkout...", { id: "rzp_checkout" });

      // 3. Open Razorpay Checkout modal
      const options = {
        key: keyId,
        amount: orderData.amount, // In paise (₹199 = 19900)
        currency: orderData.currency || "INR",
        name: "APEX 1.0",
        description: `Round 1 Entry — Team ${values.team_name}`,
        image: "/favicon.svg",
        order_id: orderData.orderId,
        prefill: {
          name: values.leader_name,
          email: values.email,
          contact: values.phone,
        },
        notes: {
          team_id: orderData.teamId,
          player_id: orderData.playerId,
          team_name: values.team_name,
        },
        theme: {
          color: "#dc2626",
        },
        modal: {
          ondismiss: () => {
            toast.dismiss("rzp_checkout");
            toast.info("PAYMENT CANCELLED", {
              description: "You closed the payment window. You can retry anytime.",
            });
            setSubmitting(false);
          },
          escape: true,
          backdropclose: false,
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          toast.dismiss("rzp_checkout");
          toast.loading("Verifying payment with server...", { id: "payment_verify" });

          try {
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              teamId: orderData.teamId,
            });

            if (verifyRes.success) {
              toast.success("PAYMENT CONFIRMED", {
                id: "payment_verify",
                description: `Team ID ${orderData.playerId} confirmed!`,
              });

              navigate({
                to: "/success",
                search: {
                  pid: orderData.playerId,
                  team: values.team_name,
                  order_id: orderData.orderId,
                },
              });
            } else {
              toast.error("PAYMENT VERIFICATION FAILED", {
                id: "payment_verify",
                description: "Signature verification failed. Please contact support.",
              });
              setSubmitting(false);
            }
          } catch (verifyErr: any) {
            console.error("[Verify Error]", verifyErr);
            toast.error("VERIFICATION FAILED", {
              id: "payment_verify",
              description: verifyErr.message || "Failed to confirm payment with backend.",
            });
            setSubmitting(false);
          }
        },
      };

      toast.dismiss("rzp_checkout");
      const rzpInstance = new window.Razorpay(options);

      rzpInstance.on("payment.failed", (failResponse: any) => {
        console.error("[Razorpay Payment Failed]", failResponse?.error);
        toast.error("PAYMENT FAILED", {
          description: failResponse?.error?.description || "Payment was rejected. You can retry with another method.",
        });
        setSubmitting(false);
      });

      rzpInstance.open();
    } catch (err: any) {
      console.error("[Registration error]", err);

      const rawMessage: string = err?.message || err?.data?.message || String(err ?? "");
      let friendlyMessage: string;

      if (rawMessage.toLowerCase().includes("already registered with a confirmed payment")) {
        friendlyMessage = "This email is already registered and paid. Please check your inbox or access pass.";
      } else if (rawMessage.toLowerCase().includes("duplicate") || rawMessage.toLowerCase().includes("unique")) {
        friendlyMessage = "A team with these credentials already exists.";
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
        subtitle="Form your 1–4 member team and submit your idea PPT link. ₹199 entry fee applies for Round 1."
      />

      <Section>
        <Reveal>
          {/* ── two-column layout ── */}
          <div className="grid gap-6 lg:gap-10 lg:grid-cols-[1fr_2fr]">

            {/* ── LEFT: Info sidebar ── */}
            <aside className="flex flex-col gap-6">

              {/* Registrations open badge */}
              <div className="glass-panel rounded-xl p-5 border border-primary/30">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                  <SystemLabel className="text-primary">REGISTRATIONS: OPEN</SystemLabel>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Secure your spot at APEX 1.0 — the premier open-innovation hackathon.
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
                      ENTRY FEE — ₹199
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
            <div className="min-w-0">
              {/* Steps indicator */}
              <div className="mb-6 flex items-center justify-between w-full max-w-sm sm:max-w-md">
                {FORM_STEPS.map((step, i) => (
                  <div key={step.id} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border border-primary/60 bg-primary/10">
                        <span className="font-mono text-[0.55rem] sm:text-[0.6rem] text-primary">{step.id}</span>
                      </div>
                      <span className="mt-1 font-mono text-[0.5rem] sm:text-[0.55rem] tracking-wider sm:tracking-widest text-muted-foreground whitespace-nowrap">
                        {step.label.toUpperCase()}
                      </span>
                    </div>
                    {i < FORM_STEPS.length - 1 && (
                      <div className="mb-3.5 sm:mb-4 mx-1 sm:mx-2 h-px flex-1 bg-border/50 min-w-1 sm:min-w-3" />
                    )}
                  </div>
                ))}
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="glass-panel grid gap-6 sm:gap-8 rounded-xl p-4 sm:p-6 md:p-8"
                  noValidate
                >
                  {/* SECTION 01 – TEAM */}
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <SystemLabel className="text-primary text-[0.65rem] sm:text-xs">SECTION_01 / TEAM</SystemLabel>
                      <div className="h-px flex-1 bg-border/40" />
                    </div>
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
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
                                <SelectTrigger className="h-10">
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
                      <SystemLabel className="text-primary text-[0.65rem] sm:text-xs">SECTION_02 / MEMBERS</SystemLabel>
                      <div className="h-px flex-1 bg-border/40" />
                    </div>
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                      <Field form={form} name="member1" label="MEMBER 1" />
                      <Field form={form} name="member2" label="MEMBER 2" />
                      {size >= 3 ? <Field form={form} name="member3" label="MEMBER 3" /> : null}
                      {size >= 4 ? <Field form={form} name="member4" label="MEMBER 4" /> : null}
                    </div>
                    <p className="mt-2.5 font-mono text-[0.6rem] sm:text-[0.65rem] tracking-wider text-muted-foreground/70">
                      ↑ MEMBER SLOTS ADJUST BASED ON SELECTED TEAM SIZE
                    </p>
                  </div>

                  {/* SECTION 03 – PROFILE */}
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <SystemLabel className="text-primary text-[0.65rem] sm:text-xs">SECTION_03 / PROFILE</SystemLabel>
                      <div className="h-px flex-1 bg-border/40" />
                      <span className="font-mono text-[0.55rem] sm:text-[0.6rem] tracking-widest text-muted-foreground">
                        OPTIONAL
                      </span>
                    </div>
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                      <Field form={form} name="preferred_domain" label="PREFERRED DOMAIN" />
                      <Field form={form} name="github_url" label="GITHUB" placeholder="https://github.com/..." />
                      <Field form={form} name="linkedin_url" label="LINKEDIN" placeholder="https://linkedin.com/..." />
                    </div>
                  </div>

                  {/* SECTION 04 – IDEA SUBMISSION */}
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <SystemLabel className="text-primary text-[0.65rem] sm:text-xs">SECTION_04 / IDEA SUBMISSION</SystemLabel>
                      <div className="h-px flex-1 bg-border/40" />
                    </div>
                    <Field
                      form={form}
                      name="ppt_url"
                      label="PPT DRIVE LINK (PUBLIC)"
                      placeholder="https://drive.google.com/..."
                    />
                    <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
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
                      className="mt-0.5"
                    />
                    <div>
                      <label htmlFor="terms" className="text-xs sm:text-sm text-muted-foreground cursor-pointer leading-relaxed">
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
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
                    <p className="font-mono text-[0.6rem] sm:text-[0.65rem] tracking-wider text-muted-foreground/70">
                      ALL FIELDS MARKED ARE REQUIRED · REVIEW BEFORE SUBMITTING
                    </p>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={submitting}
                      className="glow-primary font-mono text-xs tracking-[0.2em] w-full sm:w-auto min-h-[44px]"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> PROCESSING…
                        </>
                      ) : (
                        "REGISTER & PAY ₹199 →"
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
