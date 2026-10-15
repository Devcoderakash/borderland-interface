import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  ExternalLink,
  FileCheck,
  FileText,
  Github,
  Linkedin,
  Loader2,
  Shield,
  Sparkles,
  Trophy,
  UploadCloud,
  Users,
  X,
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
import { createOrder, verifyPayment, uploadPptFile } from "@/lib/api";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    team_name: z.string().trim().min(2, "Team name is required").max(80),
    leader_name: z.string().trim().min(2, "Leader name is required").max(80),
    email: z.string().trim().email("Enter a valid email").max(255),
    phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
    college: z.string().trim().min(2, "College or organization is required").max(120),
    team_size: z.enum(["1", "2", "3", "4"]),
    member1: z.string().trim().max(80).optional().or(z.literal("")),
    member2: z.string().trim().max(80).optional().or(z.literal("")),
    member3: z.string().trim().max(80).optional().or(z.literal("")),
    member4: z.string().trim().max(80).optional().or(z.literal("")),
    preferred_domain: z.string().trim().max(120).optional().or(z.literal("")),
    github_url: z
      .string()
      .trim()
      .max(255)
      .optional()
      .or(z.literal(""))
      .refine(
        (val) => !val || /^https?:\/\//i.test(val),
        "Enter a valid URL (starting with http:// or https://)",
      ),
    linkedin_url: z
      .string()
      .trim()
      .max(255)
      .optional()
      .or(z.literal(""))
      .refine(
        (val) => !val || /^https?:\/\//i.test(val),
        "Enter a valid URL (starting with http:// or https://)",
      ),
    ppt_url: z.string().trim().min(1, "Please upload your idea presentation (PPT or PDF)").max(500),
    terms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the APEX 1.0 rules, terms, and privacy policy" }),
    }),
  })
  .superRefine((data, ctx) => {
    const size = Number(data.team_size);
    if (size >= 2 && (!data.member1 || data.member1.trim().length < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["member1"],
        message: "Additional member 1 is required for team size of 2 or more",
      });
    }
    if (size >= 3 && (!data.member2 || data.member2.trim().length < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["member2"],
        message: "Additional member 2 is required for team size of 3 or more",
      });
    }
    if (size >= 4 && (!data.member3 || data.member3.trim().length < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["member3"],
        message: "Additional member 3 is required for team size of 4",
      });
    }
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
  { icon: Users, text: "Form a team of 1 – 4 members (Leader + up to 3)" },
  { icon: FileText, text: "Upload your idea PPT or PDF (Stored in Supabase)" },
  { icon: Shield, text: "Read and agree to Rules, Terms & Privacy Policy" },
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

  // PPT / PDF upload state
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    url: string;
    storagePath: string;
    mimeType: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setUploadError("File size exceeds 20MB limit. Please compress or choose a smaller file.");
      toast.error("File exceeds 20MB limit");
      return;
    }

    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (![".pdf", ".ppt", ".pptx"].includes(ext)) {
      setUploadError("Invalid file type. Please upload a PDF, PPT, or PPTX file.");
      toast.error("Please upload a PDF, PPT, or PPTX file");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    toast.loading("Uploading presentation to Supabase Storage...", { id: "ppt_upload" });

    try {
      const res = await uploadPptFile(file);
      setUploadedFile({
        name: file.name,
        size: file.size,
        url: res.url,
        storagePath: res.storagePath,
        mimeType: file.type,
      });
      form.setValue("ppt_url", res.storagePath, { shouldValidate: true });
      toast.success("Presentation uploaded to Supabase Storage!", { id: "ppt_upload" });
    } catch (err: any) {
      console.error("Upload error:", err);
      const msg = err.message || "Failed to upload file to storage";
      setUploadError(msg);
      toast.error(msg, { id: "ppt_upload" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadError(null);
    form.setValue("ppt_url", "", { shouldValidate: true });
  };

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
        ppt_storage_path: uploadedFile?.storagePath,
        ppt_file_name: uploadedFile?.name,
        ppt_file_type: uploadedFile?.mimeType,
        ppt_file_size: uploadedFile?.size,
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

      const keyId =
        orderData.keyId ||
        import.meta.env.VITE_RAZORPAY_KEY_ID ||
        "rzp_test_TkxgPDyek4ZYAe";

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
        key: keyId as string,
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
        subtitle="Form your 1–4 member team and upload your idea presentation (PPT/PDF). ₹199 entry fee applies for Round 1."
      />

      <Section className="pt-4 pb-14 sm:py-20 md:py-28 px-3 sm:px-8 max-w-full overflow-hidden">
        <Reveal className="w-full min-w-0 max-w-full">
          {/* ── two-column layout: form on top on mobile (order-1), instructions below (order-2) ── */}
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_2fr] gap-8 lg:gap-10 w-full min-w-0 max-w-full">

            {/* ── INSTRUCTIONS SIDEBAR: on mobile placed below form (order-2); on desktop left column (lg:order-1) ── */}
            <aside className="order-2 lg:order-1 flex flex-col gap-4 sm:gap-6 mt-4 lg:mt-0 w-full min-w-0 max-w-full">

              {/* Mobile divider heading */}
              <div className="lg:hidden flex items-center gap-3 pt-2">
                <SystemLabel className="text-primary text-[0.65rem] sm:text-xs shrink-0">
                  INSTRUCTIONS & EVENT PROTOCOLS
                </SystemLabel>
                <div className="h-px flex-1 bg-border/40" />
              </div>

              {/* Registrations open badge */}
              <div className="glass-panel rounded-xl p-4 sm:p-5 border border-primary/30">
                <div className="mb-2.5 sm:mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                  <SystemLabel className="text-primary">REGISTRATIONS: OPEN</SystemLabel>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Secure your spot at APEX 1.0 — the premier open-innovation hackathon.
                  Registrations are live and slots are limited.
                </p>
              </div>

              {/* Quick facts grid */}
              <div className="glass-panel rounded-xl p-4 sm:p-5">
                <SystemLabel className="mb-3 sm:mb-4 text-primary">EVENT DETAILS</SystemLabel>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {QUICK_FACTS.map((f) => (
                    <div key={f.label} className="rounded-lg border border-border/40 bg-muted/20 p-2.5 sm:p-3 min-w-0">
                      <p className="font-mono text-[0.55rem] sm:text-[0.6rem] tracking-[0.15em] text-muted-foreground truncate">
                        {f.label}
                      </p>
                      <p className="mt-1 font-mono text-[0.7rem] sm:text-xs font-semibold text-foreground truncate">
                        {f.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checklist */}
              <div className="glass-panel rounded-xl p-4 sm:p-5">
                <SystemLabel className="mb-3 sm:mb-4 text-primary">BEFORE YOU REGISTER</SystemLabel>
                <ul className="space-y-2.5 sm:space-y-3">
                  {CHECKLIST.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-start gap-2.5 sm:gap-3">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-primary" />
                      <span className="text-xs sm:text-sm text-muted-foreground break-words">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social links reminder */}
              <div className="glass-panel rounded-xl p-4 sm:p-5">
                <SystemLabel className="mb-2.5 sm:mb-3 text-primary">OPTIONAL BUT RECOMMENDED</SystemLabel>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground min-w-0">
                    <Github className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary/70 shrink-0" />
                    <span className="truncate">Add your GitHub to showcase prior work</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground min-w-0">
                    <Linkedin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary/70 shrink-0" />
                    <span className="truncate">Add LinkedIn for post-event networking</span>
                  </div>
                </div>
              </div>

              {/* Fee callout */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <div>
                    <p className="font-mono text-xs font-semibold tracking-widest text-amber-400">
                      ENTRY FEE — ₹199
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed break-words">
                      Instant online payment via Razorpay upon clicking register. Your team ID
                      and entry are verified immediately.
                    </p>
                  </div>
                </div>
              </div>

              {/* Official Policies Links */}
              <div className="glass-panel rounded-xl p-4 sm:p-5 border-border/80">
                <SystemLabel className="mb-2.5 sm:mb-3 text-primary">OFFICIAL PROTOCOLS</SystemLabel>
                <div className="flex flex-col gap-1.5 sm:gap-2 font-mono text-xs text-muted-foreground">
                  <a
                    href="/rules"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between hover:text-primary transition-colors py-1 border-b border-border/40 min-w-0"
                  >
                    <span className="truncate">Hackathon Rules & Scoring</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between hover:text-primary transition-colors py-1 border-b border-border/40 min-w-0"
                  >
                    <span className="truncate">Terms & Conditions</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between hover:text-primary transition-colors py-1 min-w-0"
                  >
                    <span className="truncate">Privacy Policy</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                </div>
              </div>
            </aside>

            {/* ── REGISTRATION FORM: on mobile placed at the TOP (order-1); on desktop right column (lg:order-2) ── */}
            <div className="order-1 lg:order-2 w-full min-w-0 max-w-full">
              {/* Steps indicator */}
              <div className="mb-5 sm:mb-6 flex items-center justify-between w-full max-w-sm sm:max-w-md mx-auto sm:mx-0 px-1 min-w-0">
                {FORM_STEPS.map((step, i) => (
                  <div key={step.id} className="flex items-center flex-1 last:flex-none min-w-0">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border border-primary/60 bg-primary/10">
                        <span className="font-mono text-[0.55rem] sm:text-[0.6rem] text-primary">{step.id}</span>
                      </div>
                      <span className="mt-1 font-mono text-[0.48rem] sm:text-[0.55rem] tracking-wider sm:tracking-widest text-muted-foreground whitespace-nowrap">
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
                  className="glass-panel grid gap-5 sm:gap-8 rounded-xl p-3 sm:p-6 md:p-8 w-full min-w-0 max-w-full overflow-hidden"
                  noValidate
                >
                  {/* SECTION 01 – TEAM */}
                  <div className="w-full min-w-0 max-w-full">
                    <div className="mb-3.5 sm:mb-4 flex items-center gap-2.5 sm:gap-3">
                      <SystemLabel className="text-primary text-[0.65rem] sm:text-xs shrink-0">SECTION_01 / TEAM</SystemLabel>
                      <div className="h-px flex-1 bg-border/40" />
                    </div>
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                      <Field form={form} name="team_name" label="TEAM NAME" placeholder="e.g. CyberKnights" />
                      <Field form={form} name="leader_name" label="TEAM LEADER NAME" placeholder="Full Name" />
                      <Field form={form} name="email" label="EMAIL" type="email" placeholder="leader@example.com" />
                      <Field form={form} name="phone" label="PHONE" placeholder="+91 98765 43210" />
                      <Field form={form} name="college" label="COLLEGE / ORGANIZATION" placeholder="Institution name" />
                      <FormField
                        control={form.control}
                        name="team_size"
                        render={({ field }) => (
                          <FormItem className="min-w-0 w-full">
                            <FormLabel className="system-label text-[0.65rem] sm:text-xs">TEAM SIZE</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-10 text-sm min-w-0 w-full">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {["1", "2", "3", "4"].map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s} {s === "1" ? "MEMBER (SOLO)" : "MEMBERS"}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs break-words" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* SECTION 02 – MEMBERS */}
                  <div className="w-full min-w-0 max-w-full">
                    <div className="mb-3.5 sm:mb-4 flex items-center gap-2.5 sm:gap-3">
                      <SystemLabel className="text-primary text-[0.65rem] sm:text-xs shrink-0">SECTION_02 / MEMBERS</SystemLabel>
                      <div className="h-px flex-1 bg-border/40" />
                    </div>
                    {size === 1 ? (
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 sm:p-4 font-mono text-xs text-muted-foreground leading-relaxed break-words">
                        <span className="font-semibold text-primary">SOLO PARTICIPANT ·</span> The team leader specified in Section 01 is registered as the sole participant. No additional team members are required.
                      </div>
                    ) : (
                      <>
                        <p className="mb-3 font-mono text-[0.6rem] sm:text-[0.65rem] tracking-wider text-muted-foreground/70 break-words">
                          TEAM LEADER IS ALREADY COUNTED · ADD REMAINING MEMBERS BELOW
                        </p>
                        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                          <Field form={form} name="member1" label="ADDITIONAL MEMBER 1" placeholder="Member name" />
                          {size >= 3 ? <Field form={form} name="member2" label="ADDITIONAL MEMBER 2" placeholder="Member name" /> : null}
                          {size >= 4 ? <Field form={form} name="member3" label="ADDITIONAL MEMBER 3" placeholder="Member name" /> : null}
                        </div>
                        <p className="mt-2.5 font-mono text-[0.6rem] sm:text-[0.65rem] tracking-wider text-muted-foreground/70 break-words">
                          ↑ SLOTS ADJUST WITH TEAM SIZE · LEADER + ABOVE = TOTAL TEAM
                        </p>
                      </>
                    )}
                  </div>

                  {/* SECTION 03 – PROFILE */}
                  <div className="w-full min-w-0 max-w-full">
                    <div className="mb-3.5 sm:mb-4 flex items-center gap-2.5 sm:gap-3">
                      <SystemLabel className="text-primary text-[0.65rem] sm:text-xs shrink-0">SECTION_03 / PROFILE</SystemLabel>
                      <div className="h-px flex-1 bg-border/40" />
                      <span className="font-mono text-[0.55rem] sm:text-[0.6rem] tracking-widest text-muted-foreground shrink-0">
                        OPTIONAL
                      </span>
                    </div>
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                      <Field form={form} name="preferred_domain" label="PREFERRED DOMAIN" placeholder="e.g. AI / Web3 / Fintech" />
                      <Field form={form} name="github_url" label="GITHUB" placeholder="https://github.com/..." />
                      <Field form={form} name="linkedin_url" label="LINKEDIN" placeholder="https://linkedin.com/..." />
                    </div>
                  </div>

                  {/* SECTION 04 – IDEA SUBMISSION (UPLOAD) */}
                  <div className="w-full min-w-0 max-w-full">
                    <div className="mb-3.5 sm:mb-4 flex items-center gap-2.5 sm:gap-3">
                      <SystemLabel className="text-primary text-[0.65rem] sm:text-xs shrink-0">
                        SECTION_04 / IDEA UPLOAD
                      </SystemLabel>
                      <div className="h-px flex-1 bg-border/40" />
                    </div>

                    <FormField
                      control={form.control}
                      name="ppt_url"
                      render={() => (
                        <FormItem className="w-full min-w-0 max-w-full">
                          <FormLabel className="font-mono text-[0.7rem] sm:text-xs tracking-wider text-muted-foreground uppercase flex flex-col sm:flex-row sm:items-center justify-between gap-1 w-full min-w-0">
                            <span className="break-words">UPLOAD PPT / PDF PRESENTATION *</span>
                            <span className="text-[0.65rem] text-primary/80 lowercase shrink-0">
                              .pdf, .ppt, .pptx (max 20mb)
                            </span>
                          </FormLabel>

                          <FormControl>
                            <div className="mt-2 w-full min-w-0 max-w-full">
                              {!uploadedFile ? (
                                <label
                                  htmlFor="ppt-file-input"
                                  className={cn(
                                    "relative flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/40 p-4 sm:p-8 text-center cursor-pointer transition-all duration-200 hover:border-primary/60 hover:bg-card/70 group active:scale-[0.99] w-full min-w-0 max-w-full overflow-hidden",
                                    isUploading && "pointer-events-none opacity-60",
                                    form.formState.errors.ppt_url && "border-destructive/60"
                                  )}
                                >
                                  <input
                                    id="ppt-file-input"
                                    type="file"
                                    accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                                    className="sr-only"
                                    disabled={isUploading}
                                    onChange={handleFileSelect}
                                  />
                                  <div className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110">
                                    {isUploading ? (
                                      <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary" />
                                    ) : (
                                      <UploadCloud className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                                    )}
                                  </div>
                                  <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm font-medium text-foreground px-2 break-words">
                                    {isUploading ? "Uploading presentation to Supabase Storage..." : "Tap to select or drop presentation"}
                                  </p>
                                  <p className="mt-1 text-[0.7rem] sm:text-xs text-muted-foreground px-2 break-words">
                                    Accepted formats: PPT, PPTX, or PDF · Max file size: 20MB
                                  </p>
                                  <div className="mt-2.5 sm:mt-3 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/50 px-2.5 sm:px-3 py-1 font-mono text-[0.6rem] sm:text-[0.65rem] text-muted-foreground max-w-full">
                                    <Database className="h-3 w-3 text-primary shrink-0" />
                                    <span className="truncate">Stored securely in Supabase Cloud Storage</span>
                                  </div>
                                </label>
                              ) : (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-primary/40 bg-card/60 p-3 sm:p-4 w-full min-w-0 max-w-full overflow-hidden">
                                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 overflow-hidden">
                                    <div className="grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-lg border border-primary/40 bg-primary/15 text-primary">
                                      <FileCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1 overflow-hidden">
                                      <p className="truncate text-xs sm:text-sm font-semibold text-foreground block max-w-full" title={uploadedFile.name}>
                                        {uploadedFile.name}
                                      </p>
                                      <p className="font-mono text-[0.65rem] sm:text-xs text-muted-foreground truncate block">
                                        {formatBytes(uploadedFile.size)} · Saved to Supabase
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t border-border/30 sm:border-0">
                                    <a
                                      href={uploadedFile.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center justify-center gap-1 rounded-md border border-border/60 bg-card/40 px-2.5 py-1.5 font-mono text-xs text-muted-foreground transition hover:border-primary/50 hover:text-primary min-h-[36px] flex-1 sm:flex-none"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      Preview
                                    </a>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={handleRemoveFile}
                                      className="h-9 px-2.5 font-mono text-xs text-destructive hover:bg-destructive/10 flex-1 sm:flex-none"
                                    >
                                      <X className="h-3.5 w-3.5 mr-1" />
                                      Change
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {uploadError && (
                                <p className="mt-2 font-mono text-xs text-destructive flex items-center gap-1.5 break-words">
                                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                  <span>{uploadError}</span>
                                </p>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage className="font-mono text-[0.7rem] break-words" />
                        </FormItem>
                      )}
                    />
                    <p className="mt-2 text-[0.7rem] sm:text-xs text-muted-foreground leading-relaxed break-words">
                      Upload your idea presentation (PPT or PDF). It will be securely stored in Supabase and evaluated by the official judging panel for Round 1 shortlisting.
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-border/40" />

                  {/* Rules & Guidelines Summary Card */}
                  <div className="rounded-xl border border-primary/30 bg-card/40 p-3 sm:p-5 w-full min-w-0 max-w-full overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Shield className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-mono text-[0.7rem] sm:text-xs font-bold tracking-wider text-foreground truncate">
                          APEX 1.0 PROTOCOL & RULES SUMMARY
                        </span>
                      </div>
                      <a
                        href="/rules"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[0.65rem] text-primary hover:underline flex items-center gap-1 self-start sm:self-auto shrink-0"
                      >
                        FULL GUIDELINES & SCORING <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 text-xs text-muted-foreground break-words">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <span className="break-words"><strong className="text-foreground">Team Size:</strong> 1–4 members (Leader + up to 3).</span>
                      </div>
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <span className="break-words"><strong className="text-foreground">Round 1 Online:</strong> PPT/PDF idea review. ₹199 per team.</span>
                      </div>
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <span className="break-words"><strong className="text-foreground">Round 2 Offline:</strong> Shortlisted teams pitch in Bhopal.</span>
                      </div>
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <span className="break-words"><strong className="text-foreground">Technology & AI:</strong> Open tools; solution must be original.</span>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Policies Acceptance */}
                  <div className="flex items-start gap-3 w-full min-w-0">
                    <Checkbox
                      id="terms"
                      checked={terms === true}
                      onCheckedChange={(v) =>
                        form.setValue("terms", (v === true) as true, { shouldValidate: true })
                      }
                      aria-label="Accept terms and conditions"
                      className="mt-1 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <label htmlFor="terms" className="text-xs sm:text-sm text-muted-foreground cursor-pointer leading-relaxed break-words block">
                        I and my team members have read and agree to the{" "}
                        <a href="/rules" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80 font-medium">
                          Official Rules
                        </a>
                        ,{" "}
                        <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80 font-medium">
                          Terms & Conditions
                        </a>
                        , and{" "}
                        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80 font-medium">
                          Privacy Policy
                        </a>
                        .
                      </label>
                      {form.formState.errors.terms ? (
                        <p className="mt-1 font-mono text-[0.7rem] text-destructive break-words">
                          {form.formState.errors.terms.message}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2 w-full min-w-0">
                    <p className="font-mono text-[0.6rem] sm:text-[0.65rem] tracking-wider text-muted-foreground/70 order-2 sm:order-1 text-center sm:text-left break-words">
                      ALL FIELDS MARKED ARE REQUIRED · REVIEW BEFORE SUBMITTING
                    </p>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={submitting}
                      className="group glow-primary font-mono text-xs sm:text-sm tracking-wider sm:tracking-[0.2em] w-full sm:w-auto min-h-[48px] sm:min-h-[44px] px-4 sm:px-8 whitespace-normal sm:whitespace-nowrap order-1 sm:order-2 transition-all duration-200"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                          <span>PROCESSING…</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1.5 sm:gap-2 text-center">
                          <span>REGISTER & PAY ₹199</span>
                          <span className="inline-block transition-transform duration-200 group-hover:translate-x-1 shrink-0">&rarr;</span>
                        </span>
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
        <FormItem className="min-w-0 w-full">
          <FormLabel className="system-label text-[0.65rem] sm:text-xs truncate block">{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              value={typeof field.value === "string" ? field.value : ""}
              type={type}
              placeholder={placeholder}
              className="h-10 text-sm min-w-0 w-full"
            />
          </FormControl>
          <FormMessage className="text-xs break-words" />
        </FormItem>
      )}
    />
  );
}
