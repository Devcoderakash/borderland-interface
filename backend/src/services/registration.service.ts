import crypto from "node:crypto";
import { supabase } from "./supabase.service.js";

export const REGISTRATION_FEE_INR = 150;
export const REGISTRATION_FEE_PAISE = REGISTRATION_FEE_INR * 100;

export interface RegisterTeamInput {
  team_name: string;
  leader_name: string;
  email: string;
  phone: string;
  college: string;
  team_size: number;
  ppt_url: string;
  preferred_domain?: string;
  github_url?: string;
  linkedin_url?: string;
  members: { full_name: string; position: number }[];
}

export async function createPendingRegistration(payload: RegisterTeamInput) {
  const teamId = crypto.randomUUID();
  const playerId = `APEX-${Math.floor(1000 + Math.random() * 9000)}`;
  const cleanId = teamId.replace(/-/g, "").slice(0, 16);
  const orderId = `order_${cleanId}`;

  // 1. Insert team
  const { error: teamError } = await supabase.from("teams").insert({
    id: teamId,
    player_id: playerId,
    team_name: payload.team_name,
    leader_name: payload.leader_name,
    email: payload.email,
    phone: payload.phone,
    college: payload.college || "",
    team_size: Number(payload.team_size || 2),
    suit: "spades",
    ppt_url: payload.ppt_url || "",
    preferred_domain: payload.preferred_domain || null,
    github_url: payload.github_url || null,
    linkedin_url: payload.linkedin_url || null,
    payment_status: "pending",
    payment_amount: REGISTRATION_FEE_PAISE,
    payment_currency: "INR",
    payment_order_id: orderId,
    cashfree_order_id: orderId,
  });

  if (teamError) {
    throw new Error(`Failed to create team record: ${teamError.message}`);
  }

  // 2. Insert members
  if (Array.isArray(payload.members) && payload.members.length > 0) {
    const membersToInsert = payload.members.map((m) => ({
      ...m,
      team_id: teamId,
    }));
    const { error: membersError } = await supabase
      .from("team_members")
      .insert(membersToInsert);

    if (membersError) {
      console.warn("[Registration Service] Warning inserting team members:", membersError.message);
    }
  }

  return { teamId, playerId, cleanId, orderId };
}

export async function getTeamByOrderId(orderId: string) {
  const { data: team, error } = await supabase
    .from("teams")
    .select("*")
    .or(`payment_order_id.eq.${orderId},cashfree_order_id.eq.${orderId}`)
    .maybeSingle();

  if (error || !team) {
    return null;
  }
  return team;
}

export async function markTeamPaid(orderId: string, paymentDetails: Record<string, any>) {
  const now = new Date().toISOString();
  const paymentId = paymentDetails.cf_payment_id || paymentDetails.payment_id || `cf_${Date.now()}`;

  const { error } = await supabase
    .from("teams")
    .update({
      payment_status: "paid",
      payment_id: String(paymentId),
      paid_at: now,
      status: "approved",
    })
    .or(`payment_order_id.eq.${orderId},cashfree_order_id.eq.${orderId}`);

  if (error) {
    console.error("[Registration Service] Error updating team payment status:", error);
    throw error;
  }
}
