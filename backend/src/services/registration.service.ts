import crypto from "node:crypto";
import { supabase } from "./supabase.service.js";

export const REGISTRATION_FEE_INR = 199;
export const REGISTRATION_FEE_PAISE = REGISTRATION_FEE_INR * 100; // 19900 paise

export interface RegisterTeamInput {
  team_name: string;
  leader_name: string;
  email: string;
  phone: string;
  college: string;
  team_size: number;
  ppt_url: string;
  ppt_storage_path?: string;
  ppt_file_name?: string;
  ppt_file_type?: string;
  ppt_file_size?: number;
  preferred_domain?: string;
  github_url?: string;
  linkedin_url?: string;
  members: { full_name: string; position: number }[];
}

// Resilient memory cache (ensures app works smoothly even if Supabase schema cache is warming up or table is pending)
const localTeamStore = new Map<string, any>();

export function getAllStoredTeams(): any[] {
  return Array.from(localTeamStore.values()).sort(
    (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
  );
}

export async function createPendingRegistration(payload: RegisterTeamInput) {
  const normEmail = payload.email.trim().toLowerCase();

  // 1. Check existing team in Supabase or local store
  let existingTeam: any = null;
  try {
    const { data, error } = await supabase
      .from("teams")
      .select("id, player_id, payment_status, razorpay_order_id, payment_order_id")
      .eq("email", normEmail)
      .maybeSingle();

    if (!error && data) {
      existingTeam = data;
    }
  } catch (err) {
    console.warn("[Registration Service] Supabase check bypassed, using local store:", (err as any)?.message);
  }

  if (!existingTeam) {
    for (const t of localTeamStore.values()) {
      if (t.email === normEmail) {
        existingTeam = t;
        break;
      }
    }
  }

  if (existingTeam) {
    if (existingTeam.payment_status === "paid") {
      throw new Error("This email is already registered with a confirmed payment.");
    }

    // Reuse existing pending registration
    const cleanId = existingTeam.id.replace(/-/g, "").slice(0, 16);
    const orderRef = `apex_${cleanId}_${Date.now().toString().slice(-6)}`;

    const updatedData = {
      ...existingTeam,
      team_name: payload.team_name,
      leader_name: payload.leader_name,
      phone: payload.phone,
      college: payload.college || "",
      team_size: Number(payload.team_size || 2),
      ppt_url: payload.ppt_url || "",
      ppt_storage_path: payload.ppt_storage_path || null,
      ppt_file_name: payload.ppt_file_name || null,
      ppt_file_type: payload.ppt_file_type || null,
      ppt_file_size: payload.ppt_file_size || null,
      preferred_domain: payload.preferred_domain || null,
      github_url: payload.github_url || null,
      linkedin_url: payload.linkedin_url || null,
      payment_status: "pending",
      payment_amount: REGISTRATION_FEE_PAISE,
      payment_currency: "INR",
      payment_order_id: orderRef,
      updated_at: new Date().toISOString(),
    };

    localTeamStore.set(existingTeam.id, updatedData);

    try {
      await supabase
        .from("teams")
        .update({
          team_name: payload.team_name,
          leader_name: payload.leader_name,
          phone: payload.phone,
          college: payload.college || "",
          team_size: Number(payload.team_size || 2),
          ppt_url: payload.ppt_url || "",
          ppt_storage_path: payload.ppt_storage_path || null,
          ppt_file_name: payload.ppt_file_name || null,
          ppt_file_type: payload.ppt_file_type || null,
          ppt_file_size: payload.ppt_file_size || null,
          preferred_domain: payload.preferred_domain || null,
          github_url: payload.github_url || null,
          linkedin_url: payload.linkedin_url || null,
          payment_status: "pending",
          payment_amount: REGISTRATION_FEE_PAISE,
          payment_currency: "INR",
          payment_order_id: orderRef,
        })
        .eq("id", existingTeam.id);
    } catch (e) {
      console.warn("[Registration Service] Supabase update warning:", (e as any)?.message);
    }

    return {
      teamId: existingTeam.id,
      playerId: existingTeam.player_id,
      cleanId,
      orderId: orderRef,
    };
  }

  // Brand new team
  const teamId = crypto.randomUUID();
  const playerId = `APEX-${Math.floor(1000 + Math.random() * 9000)}`;
  const cleanId = teamId.replace(/-/g, "").slice(0, 16);
  const orderId = `apex_${cleanId}`;

  const newTeam = {
    id: teamId,
    player_id: playerId,
    team_name: payload.team_name,
    leader_name: payload.leader_name,
    email: normEmail,
    phone: payload.phone,
    college: payload.college || "",
    team_size: Number(payload.team_size || 2),
    suit: "spades",
    ppt_url: payload.ppt_url || "",
    ppt_storage_path: payload.ppt_storage_path || null,
    ppt_file_name: payload.ppt_file_name || null,
    ppt_file_type: payload.ppt_file_type || null,
    ppt_file_size: payload.ppt_file_size || null,
    preferred_domain: payload.preferred_domain || null,
    github_url: payload.github_url || null,
    linkedin_url: payload.linkedin_url || null,
    payment_status: "pending",
    payment_amount: REGISTRATION_FEE_PAISE,
    payment_currency: "INR",
    payment_order_id: orderId,
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    members: payload.members || [],
  };

  localTeamStore.set(teamId, newTeam);

  // Attempt to write to Supabase
  try {
    const { error: teamError } = await supabase.from("teams").insert({
      id: teamId,
      player_id: playerId,
      team_name: payload.team_name,
      leader_name: payload.leader_name,
      email: normEmail,
      phone: payload.phone,
      college: payload.college || "",
      team_size: Number(payload.team_size || 2),
      suit: "spades",
      ppt_url: payload.ppt_url || "",
      ppt_storage_path: payload.ppt_storage_path || null,
      ppt_file_name: payload.ppt_file_name || null,
      ppt_file_type: payload.ppt_file_type || null,
      ppt_file_size: payload.ppt_file_size || null,
      preferred_domain: payload.preferred_domain || null,
      github_url: payload.github_url || null,
      linkedin_url: payload.linkedin_url || null,
      payment_status: "pending",
      payment_amount: REGISTRATION_FEE_PAISE,
      payment_currency: "INR",
      payment_order_id: orderId,
    });

    if (teamError) {
      console.warn("[Registration Service] Supabase insert note:", teamError.message);
    } else if (Array.isArray(payload.members) && payload.members.length > 0) {
      const membersToInsert = payload.members.map((m) => ({
        ...m,
        team_id: teamId,
      }));
      await supabase.from("team_members").insert(membersToInsert);
    }
  } catch (err: any) {
    console.warn("[Registration Service] Supabase unreachable or table pending, preserved in local storage:", err.message);
  }

  return { teamId, playerId, cleanId, orderId };
}

export async function attachRazorpayOrder(teamId: string, razorpayOrderId: string) {
  const localTeam = localTeamStore.get(teamId);
  if (localTeam) {
    localTeam.razorpay_order_id = razorpayOrderId;
    localTeam.payment_order_id = razorpayOrderId;
  }

  try {
    await supabase
      .from("teams")
      .update({
        razorpay_order_id: razorpayOrderId,
        payment_order_id: razorpayOrderId,
      })
      .eq("id", teamId);
  } catch (err: any) {
    console.warn("[Registration Service] attachRazorpayOrder Supabase note:", err.message);
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getTeamByOrderId(orderId: string) {
  // 1. Try Supabase
  try {
    const isUuid = UUID_REGEX.test(orderId);
    let query = supabase.from("teams").select("*, team_members(*)");
    let res;
    if (isUuid) {
      res = await query.or(`id.eq.${orderId},player_id.eq.${orderId}`).maybeSingle();
    } else {
      res = await query
        .or(`razorpay_order_id.eq.${orderId},payment_order_id.eq.${orderId},player_id.eq.${orderId}`)
        .maybeSingle();
    }

    if (!res.error && res.data) {
      return res.data;
    }
  } catch (err) {
    // Fall through to memory store
  }

  // 2. Try memory store
  for (const team of localTeamStore.values()) {
    if (
      team.razorpay_order_id === orderId ||
      team.payment_order_id === orderId ||
      team.id === orderId ||
      team.player_id === orderId
    ) {
      return team;
    }
  }

  return null;
}

export async function markTeamPaid(
  orderId: string,
  paymentDetails: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature?: string;
  },
) {
  const now = new Date().toISOString();
  const paymentId = paymentDetails.razorpay_payment_id;
  const isUuid = UUID_REGEX.test(orderId);

  // Update memory store
  for (const team of localTeamStore.values()) {
    if (
      team.razorpay_order_id === orderId ||
      team.payment_order_id === orderId ||
      team.id === orderId
    ) {
      team.payment_status = "paid";
      team.payment_id = paymentId;
      team.razorpay_order_id = paymentDetails.razorpay_order_id;
      team.payment_signature = paymentDetails.razorpay_signature || null;
      team.paid_at = now;
      team.status = "approved";
      break;
    }
  }

  // Update Supabase
  try {
    const updatePayload = {
      payment_status: "paid",
      payment_id: String(paymentId),
      razorpay_order_id: paymentDetails.razorpay_order_id,
      payment_signature: paymentDetails.razorpay_signature || null,
      paid_at: now,
      status: "approved" as const,
    };

    let query = supabase.from("teams").update(updatePayload);
    if (isUuid) {
      const { error } = await query.eq("id", orderId);
      if (error) console.error("[Registration Service] markTeamPaid UUID error:", error.message);
    } else {
      const { error } = await query.or(
        `razorpay_order_id.eq.${orderId},payment_order_id.eq.${orderId}`,
      );
      if (error) console.error("[Registration Service] markTeamPaid orderId error:", error.message);
    }
  } catch (err: any) {
    console.warn("[Registration Service] markTeamPaid Supabase note:", err.message);
  }
}

export async function markTeamFailed(orderId: string) {
  const isUuid = UUID_REGEX.test(orderId);

  for (const team of localTeamStore.values()) {
    if (
      team.razorpay_order_id === orderId ||
      team.payment_order_id === orderId ||
      team.id === orderId
    ) {
      team.payment_status = "failed";
      break;
    }
  }

  try {
    let query = supabase.from("teams").update({ payment_status: "failed" });
    if (isUuid) {
      await query.eq("id", orderId);
    } else {
      await query.or(`razorpay_order_id.eq.${orderId},payment_order_id.eq.${orderId}`);
    }
  } catch (err: any) {
    console.warn("[Registration Service] markTeamFailed note:", err.message);
  }
}

export function updateStoredTeam(id: string, updates: any): any | null {
  for (const [key, team] of localTeamStore.entries()) {
    if (team.id === id || team.player_id === id) {
      const updated = { ...team, ...updates, updated_at: new Date().toISOString() };
      localTeamStore.set(key, updated);
      return updated;
    }
  }
  return null;
}

export function deleteStoredTeam(id: string): boolean {
  for (const [key, team] of localTeamStore.entries()) {
    if (team.id === id || team.player_id === id) {
      localTeamStore.delete(key);
      return true;
    }
  }
  return false;
}
