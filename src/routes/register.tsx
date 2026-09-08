import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { SUITS, type SuitKey } from "@/lib/borderland";
import { cn } from "@/lib/utils";

const schema = z.object({
  team_name: z.string().trim().min(2, "Team name is required").max(80),
  leader_name: z.string().trim().min(2, "Leader name is required").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
  college: z.string().trim().min(2, "College or organization is required").max(120),
  team_size: z.enum(["2", "3", "4"]),
  member1: z.string().trim().min(2, "At least two players are required").max(80),
  member2: z.string().trim().max(80).optional().or(z.literal("")),
  member3: z.string().trim().max(80).optional().or(z.literal("")),
  member4: z.string().trim().max(80).optional().or(z.literal("")),
  preferred_domain: z.string().trim().max(120).optional().or(z.literal("")),
  github_url: z.string().trim().url("Enter a valid URL").max(255).optional().or(z.literal("")),
  linkedin_url: z.string().trim().url("Enter a valid URL").max(255).optional().or(z.literal("")),
  suit: z.enum(["spades", "diamonds", "clubs", "hearts"]),
  terms: z.literal(true, { errorMap: () => ({ message: "You must accept the protocols" }) }),
});

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Enter the Game — BORDER//LAND Registration" },
      {
        name: "description",
        content:
          "Register your team of 2–4 for BORDER//LAND, choose your suit and receive your player ID.",
      },
      { property: "og:title", content: "Enter the Game — BORDER//LAND Registration" },
      { property: "og:description", content: "Form your team. Choose your suit. Enter the games." },
      { property: "og:url", content: "/register" },
    ],
    links: [{ rel: "canonical", href: "/register" }],
  }),
  component: RegisterPage,
});

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
      suit: "spades",
      terms: false as unknown as true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    const playerId = `BL-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      const { data, error } = await supabase
        .from("teams")
        .insert({
          player_id: playerId,
          team_name: values.team_name,
          leader_name: values.leader_name,
          email: values.email,
          phone: values.phone,
          college: values.college,
          team_size: Number(values.team_size),
          suit: values.suit,
          preferred_domain: values.preferred_domain || null,
          github_url: values.github_url || null,
          linkedin_url: values.linkedin_url || null,
        })
        .select("id")
        .maybeSingle();

      if (error) throw error;

      const members = [values.member1, values.member2, values.member3, values.member4]
        .map((m, i) => ({ full_name: (m ?? "").trim(), position: i + 1 }))
        .filter((m) => m.full_name.length > 1);

      if (data?.id && members.length) {
        await supabase
          .from("team_members")
          .insert(members.map((m) => ({ ...m, team_id: data.id })));
      }

      toast.success("REGISTRATION COMPLETE", { description: `PLAYER ID ${playerId}` });
      navigate({
        to: "/success",
        search: { pid: playerId, team: values.team_name, suit: values.suit },
      });
    } catch (err) {
      console.error(err);
      toast.error("REGISTRATION FAILED", {
        description: "The Borderland rejected your entry. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const size = Number(form.watch("team_size"));
  const suit = form.watch("suit");

  return (
    <>
      <PageHeader
        code="SYSTEM_12 / ENTRY"
        title="Enter the game"
        subtitle="Form your team, choose your suit, and receive your player ID. Entry is free."
      />

      <Section>
        <Reveal>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="glass-panel grid gap-6 rounded-xl p-6 sm:p-8"
              noValidate
            >
              <div>
                <SystemLabel className="text-primary">SECTION_01 / TEAM</SystemLabel>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
                                {s} PLAYERS
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

              <div>
                <SystemLabel className="text-primary">SECTION_02 / PLAYERS</SystemLabel>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field form={form} name="member1" label="MEMBER 1" />
                  <Field form={form} name="member2" label="MEMBER 2" />
                  {size >= 3 ? <Field form={form} name="member3" label="MEMBER 3" /> : null}
                  {size >= 4 ? <Field form={form} name="member4" label="MEMBER 4" /> : null}
                </div>
              </div>

              <div>
                <SystemLabel className="text-primary">SECTION_03 / PROFILE</SystemLabel>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <Field form={form} name="preferred_domain" label="PREFERRED DOMAIN" />
                  <Field form={form} name="github_url" label="GITHUB" placeholder="https://" />
                  <Field form={form} name="linkedin_url" label="LINKEDIN" placeholder="https://" />
                </div>
              </div>

              <div>
                <SystemLabel className="text-primary">SECTION_04 / CHOOSE YOUR SUIT</SystemLabel>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {SUITS.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      aria-pressed={suit === s.key}
                      onClick={() => form.setValue("suit", s.key as SuitKey)}
                      className={cn(
                        "rounded-lg border p-4 text-left transition-all",
                        suit === s.key
                          ? cn("border-current bg-current/10", s.colorClass)
                          : "border-border text-muted-foreground hover:border-foreground/40",
                      )}
                    >
                      <span className="text-2xl">{s.symbol}</span>
                      <p className="mt-2 font-display text-xs font-bold tracking-[0.16em]">
                        {s.role}
                      </p>
                      <p className="mt-1 font-mono text-[0.65rem] tracking-[0.14em]">{s.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(v) => field.onChange(v === true)}
                        aria-label="Accept terms and conditions"
                      />
                    </FormControl>
                    <div>
                      <FormLabel className="text-sm font-normal text-muted-foreground">
                        I accept the Borderland protocols, the rules of fair play and the judging
                        terms.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="glow-primary font-mono text-xs tracking-[0.2em]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> TRANSMITTING…
                  </>
                ) : (
                  "REGISTER MY TEAM →"
                )}
              </Button>
            </form>
          </Form>
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
