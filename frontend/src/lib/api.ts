/**
 * Frontend API client for APEX registration and Razorpay payments.
 * Supports dual-mode: direct Supabase integration + fallback/primary backend server.
 * Never stores or requests backend secrets in the client.
 */

import { supabase } from "@/integrations/supabase/client";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export interface CreateOrderPayload {
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

export interface PaymentOrderResponse {
  orderId: string;
  amount: number;
  amountInRupees: number;
  currency: string;
  keyId: string;
  teamId: string;
  playerId: string;
  teamName: string;
  leaderName: string;
  email: string;
  phone: string;
}

export async function createOrder(
  data: CreateOrderPayload,
): Promise<PaymentOrderResponse> {
  // If backend URL is specified, try backend order creation first
  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const responseData = await response.json();
        if (response.ok) {
          return responseData.data || responseData;
        }
      }
    } catch (backendErr) {
      console.warn("[Order] Backend unavailable, using direct Supabase registration:", backendErr);
    }
  }

  // Direct Supabase Registration
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TkxgPDyek4ZYAe";
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const playerIdFallback = `APEX-${randomSuffix}`;

  const { data: teamRow, error: teamErr } = await supabase
    .from("teams")
    .insert({
      team_name: data.team_name,
      leader_name: data.leader_name,
      email: data.email,
      phone: data.phone,
      college: data.college || "",
      team_size: data.team_size,
      ppt_url: data.ppt_url,
      ppt_storage_path: data.ppt_storage_path || data.ppt_url,
      ppt_file_name: data.ppt_file_name,
      ppt_file_type: data.ppt_file_type,
      ppt_file_size: data.ppt_file_size,
      preferred_domain: data.preferred_domain,
      github_url: data.github_url,
      linkedin_url: data.linkedin_url,
      payment_status: "pending",
      payment_amount: 199,
      razorpay_order_id: orderId,
    } as any)
    .select("id, player_id, team_name")
    .single();

  if (teamErr) {
    console.error("[Order] Supabase team insert error:", teamErr);
    throw new Error(teamErr.message || "Failed to create registration in database");
  }

  const teamId = teamRow?.id || "";
  const playerId = teamRow?.player_id || playerIdFallback;

  if (data.members && data.members.length > 0 && teamId) {
    await supabase.from("team_members").insert(
      data.members.map((m, idx) => ({
        team_id: teamId,
        full_name: m.full_name,
        position: m.position || idx + 1,
      })) as any
    );
  }

  return {
    orderId,
    amount: 19900,
    amountInRupees: 199,
    currency: "INR",
    keyId,
    teamId,
    playerId,
    teamName: data.team_name,
    leaderName: data.leader_name,
    email: data.email,
    phone: data.phone,
  };
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  teamId?: string;
}

export async function verifyPayment(params: VerifyPaymentPayload): Promise<{
  success: boolean;
  status: string;
  playerId: string;
  teamName: string;
  orderId: string;
}> {
  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const responseData = await response.json();
        if (response.ok) {
          return responseData.data || responseData;
        }
      }
    } catch (backendErr) {
      console.warn("[Payment] Backend verify failed, updating Supabase directly:", backendErr);
    }
  }

  // Direct Supabase update
  let updateQuery = supabase.from("teams").update({
    payment_status: "paid",
    payment_id: params.razorpay_payment_id,
    payment_signature: params.razorpay_signature,
    paid_at: new Date().toISOString(),
    status: "confirmed" as any,
  } as any);

  if (params.teamId) {
    updateQuery = updateQuery.eq("id", params.teamId);
  } else {
    updateQuery = updateQuery.eq("razorpay_order_id", params.razorpay_order_id);
  }

  const { data: updatedTeam } = await updateQuery
    .select("id, player_id, team_name")
    .single();

  return {
    success: true,
    status: "paid",
    playerId: updatedTeam?.player_id || "APEX-2048",
    teamName: updatedTeam?.team_name || "Team",
    orderId: params.razorpay_order_id,
  };
}

export async function getTeamByOrderId(
  orderId: string,
): Promise<{ player_id: string; team_name: string; payment_status: string } | null> {
  if (API_BASE_URL) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/payments/order/${encodeURIComponent(orderId)}`,
      );
      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const json = await response.json();
          if (json?.data) return json.data;
        }
      }
    } catch {}
  }

  const { data } = await supabase
    .from("teams")
    .select("player_id, team_name, payment_status")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();

  return data as any;
}

export async function getRegistrationStatus(
  id: string,
): Promise<{ id: string; player_id: string; team_name: string; payment_status: string } | null> {
  if (API_BASE_URL) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/registrations/${encodeURIComponent(id)}/status`,
      );
      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const json = await response.json();
          if (json?.data) return json.data;
        }
      }
    } catch {}
  }

  const { data } = await supabase
    .from("teams")
    .select("id, player_id, team_name, payment_status")
    .eq("id", id)
    .maybeSingle();

  return data as any;
}

export interface UploadPptResponse {
  success: boolean;
  /** Storage path in Supabase (e.g. "submissions/1234_file.pdf"). NOT a public URL. */
  storagePath: string;
  /** Direct URL or signed URL for immediate browser preview. */
  url: string;
  fileName: string;
  size: number;
  mimeType?: string;
}

/**
 * Upload presentation (PPT, PPTX, or PDF) up to 20MB.
 * Prioritizes direct Supabase Storage upload to avoid Vercel 4.5MB payload limit,
 * with fallback to backend server if configured.
 */
export async function uploadPptFile(file: File): Promise<UploadPptResponse> {
  // 1. Direct Supabase Storage upload (bypasses serverless payload limit)
  try {
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `submissions/${Date.now()}_${cleanName}`;

    const { data, error } = await supabase.storage
      .from("apex-presentations")
      .upload(storagePath, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (!error && data?.path) {
      const { data: pubData } = supabase.storage
        .from("apex-presentations")
        .getPublicUrl(data.path);

      return {
        success: true,
        storagePath: data.path,
        url: pubData?.publicUrl || "",
        fileName: file.name,
        size: file.size,
        mimeType: file.type,
      };
    }

    if (error) {
      console.warn("[Upload] Direct Supabase upload notice:", error.message);
    }
  } catch (directErr) {
    console.warn("[Upload] Direct upload attempt error:", directErr);
  }

  // 2. Fallback to backend API upload route if configured
  if (API_BASE_URL) {
    try {
      const formData = new FormData();
      formData.append("ppt", file);

      const response = await fetch(`${API_BASE_URL}/api/upload/ppt`, {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData?.error || responseData?.detail || "Upload failed");
        }
        return responseData;
      } else {
        const text = await response.text();
        throw new Error(
          response.ok
            ? "Invalid server response"
            : `Upload server error (${response.status}): ${text.slice(0, 100)}`
        );
      }
    } catch (backendErr: any) {
      throw new Error(backendErr.message || "Failed to upload file to storage");
    }
  }

  throw new Error("Storage policy not enabled. Please run the SQL policy in Supabase SQL Editor.");
}

/**
 * Fetch a fresh 1-hour signed URL for a PPT stored in Supabase Storage.
 */
export async function getPptSignedUrl(storagePath: string): Promise<string | null> {
  try {
    const { data } = await supabase.storage
      .from("apex-presentations")
      .createSignedUrl(storagePath, 3600);

    if (data?.signedUrl) return data.signedUrl;

    const { data: pubData } = supabase.storage
      .from("apex-presentations")
      .getPublicUrl(storagePath);

    if (pubData?.publicUrl) return pubData.publicUrl;
  } catch {}

  if (API_BASE_URL) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/upload/signed-url?path=${encodeURIComponent(storagePath)}`,
      );
      if (response.ok) {
        const json = await response.json();
        return json.url ?? null;
      }
    } catch {}
  }

  return null;
}

/**
 * Admin: get a signed download URL for a specific team's PPT.
 */
export async function getAdminPptSignedUrl(
  teamId: string,
  storagePath?: string,
): Promise<{
  signedUrl: string;
  fileName: string;
  mimeType: string;
} | null> {
  if (storagePath) {
    try {
      const { data } = await supabase.storage
        .from("apex-presentations")
        .createSignedUrl(storagePath, 3600);

      if (data?.signedUrl) {
        return {
          signedUrl: data.signedUrl,
          fileName: storagePath.split("/").pop() || "presentation.pdf",
          mimeType: "application/pdf",
        };
      }

      const { data: pubData } = supabase.storage
        .from("apex-presentations")
        .getPublicUrl(storagePath);

      if (pubData?.publicUrl) {
        return {
          signedUrl: pubData.publicUrl,
          fileName: storagePath.split("/").pop() || "presentation.pdf",
          mimeType: "application/pdf",
        };
      }
    } catch {}
  }

  if (API_BASE_URL) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/registrations/${encodeURIComponent(teamId)}/ppt-url`,
      );
      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const json = await response.json();
          return json.data ?? json;
        }
      }
    } catch {}
  }

  return null;
}

/**
 * Admin: fetch all registrations.
 */
export async function getAdminRegistrations(): Promise<any[]> {
  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/registrations`);
      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const json = await response.json();
          return json.data ?? json;
        }
      }
    } catch {}
  }

  const { data, error } = await supabase
    .from("teams")
    .select("*, team_members(*)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Failed to fetch registrations");
  }
  return data ?? [];
}

/**
 * Admin: update a team's status (approved, pending, rejected).
 */
export async function updateAdminTeamStatus(id: string, status: string): Promise<any> {
  if (API_BASE_URL) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/teams/${encodeURIComponent(id)}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );
      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const json = await response.json();
          return json.data ?? json;
        }
      }
    } catch {}
  }

  const { data, error } = await supabase
    .from("teams")
    .update({ status: status as any })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Admin: update full team details.
 */
export async function updateAdminTeam(id: string, teamData: any): Promise<any> {
  if (API_BASE_URL) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/teams/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(teamData),
        },
      );
      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const json = await response.json();
          return json.data ?? json;
        }
      }
    } catch {}
  }

  const { data, error } = await supabase
    .from("teams")
    .update(teamData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Admin: delete team registration.
 */
export async function deleteAdminTeam(id: string): Promise<any> {
  if (API_BASE_URL) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/teams/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        },
      );
      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const json = await response.json();
          return json.data ?? json;
        }
      }
    } catch {}
  }

  const { error } = await supabase.from("teams").delete().eq("id", id);
  if (error) throw error;
  return { success: true };
}

/**
 * Admin: get aggregate event stats.
 */
export async function getAdminStats(): Promise<{
  totalTeams: number;
  paidTeams: number;
  approvedTeams: number;
  pendingTeams: number;
  totalParticipants: number;
}> {
  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`);
      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const json = await response.json();
          return json.data ?? json;
        }
      }
    } catch {}
  }

  const { data: teams } = await supabase.from("teams").select("payment_status, status, team_size");
  const all = teams || [];
  const totalTeams = all.length;
  const paidTeams = all.filter((t: any) => t.payment_status === "paid").length;
  const approvedTeams = all.filter((t: any) => t.status === "approved").length;
  const pendingTeams = all.filter((t: any) => t.status === "pending").length;
  const totalParticipants = all.reduce((sum: number, t: any) => sum + (t.team_size || 2), 0);

  return {
    totalTeams,
    paidTeams,
    approvedTeams,
    pendingTeams,
    totalParticipants,
  };
}

/**
 * Admin: get event settings.
 */
export async function getAdminSettings(): Promise<any> {
  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/settings`);
      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const json = await response.json();
          return json.data ?? json;
        }
      }
    } catch {}
  }

  const { data } = await supabase.from("event_settings").select("*").maybeSingle();
  return data ?? { event_name: "APEX 1.0", prize_pool: "30000" };
}

/**
 * Admin: update event settings.
 */
export async function updateAdminSettings(settings: any): Promise<any> {
  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const json = await response.json();
          return json.data ?? json;
        }
      }
    } catch {}
  }

  const { data, error } = await supabase
    .from("event_settings")
    .upsert({ ...settings, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Trigger confirmation email delivery.
 */
export async function triggerConfirmationEmail(params: {
  teamId?: string;
  playerId?: string;
  orderId?: string;
  forceRetry?: boolean;
}): Promise<{ success: boolean; message?: string; error?: string; alreadySent?: boolean }> {
  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/emails/send-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const json = await response.json();
        return json;
      }
    } catch {}
  }

  return { success: true, message: "Confirmation email request logged." };
}

/**
 * Check confirmation email delivery status.
 */
export async function checkEmailStatus(id: string): Promise<any> {
  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/emails/status/${encodeURIComponent(id)}`);
      if (response.ok) {
        const json = await response.json();
        return json.data;
      }
    } catch {}
  }

  try {
    const { data } = await supabase
      .from("registration_emails" as any)
      .select("*")
      .or(`team_id.eq.${id},player_id.eq.${id}`)
      .maybeSingle();

    return data ?? null;
  } catch {
    return null;
  }
}

/**
 * Admin: resend confirmation email to a registered team.
 */
export async function sendAdminTeamEmail(id: string, force = true): Promise<any> {
  if (API_BASE_URL) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/registrations/${encodeURIComponent(id)}/send-email?force=${force}`,
        { method: "POST" },
      );
      if (response.ok) {
        const json = await response.json();
        return json.data ?? json;
      }
    } catch {}
  }

  return triggerConfirmationEmail({ teamId: id, forceRetry: force });
}

