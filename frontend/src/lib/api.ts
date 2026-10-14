/**
 * Frontend API client for APEX registration and Razorpay payments.
 * Never stores or requests backend secrets in the client.
 */

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
  const response = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData?.error || "Failed to create registration order");
  }

  return responseData.data || responseData;
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
  const response = await fetch(`${API_BASE_URL}/api/payments/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData?.error || "Failed to verify payment");
  }

  return responseData.data || responseData;
}

export async function getTeamByOrderId(
  orderId: string,
): Promise<{ player_id: string; team_name: string; payment_status: string } | null> {
  const response = await fetch(
    `${API_BASE_URL}/api/payments/order/${encodeURIComponent(orderId)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    return null;
  }

  const json = await response.json();
  return json.data || json;
}

export async function getRegistrationStatus(
  id: string,
): Promise<{ id: string; player_id: string; team_name: string; payment_status: string } | null> {
  const response = await fetch(
    `${API_BASE_URL}/api/registrations/${encodeURIComponent(id)}/status`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    return null;
  }

  const json = await response.json();
  return json.data || json;
}

export interface UploadPptResponse {
  success: boolean;
  /** Storage path in Supabase (e.g. "submissions/1234_file.pdf"). NOT a public URL. */
  storagePath: string;
  /** Short-lived signed URL for immediate browser preview (1 hour). */
  url: string;
  fileName: string;
  size: number;
  mimeType?: string;
}

export async function uploadPptFile(file: File): Promise<UploadPptResponse> {
  const formData = new FormData();
  formData.append("ppt", file);

  const response = await fetch(`${API_BASE_URL}/api/upload/ppt`, {
    method: "POST",
    body: formData,
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData?.error || responseData?.detail || "Failed to upload file");
  }

  return responseData;
}

/**
 * Fetch a fresh 1-hour signed URL for a PPT stored in Supabase Storage.
 * Used for admin preview; the storagePath comes from the database record.
 */
export async function getPptSignedUrl(storagePath: string): Promise<string | null> {
  const response = await fetch(
    `${API_BASE_URL}/api/upload/signed-url?path=${encodeURIComponent(storagePath)}`,
  );
  if (!response.ok) return null;
  const json = await response.json();
  return json.url ?? null;
}

/**
 * Admin: get a signed download URL for a specific team's PPT.
 */
export async function getAdminPptSignedUrl(teamId: string): Promise<{
  signedUrl: string;
  fileName: string;
  mimeType: string;
} | null> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/registrations/${encodeURIComponent(teamId)}/ppt-url`,
  );
  if (!response.ok) return null;
  const json = await response.json();
  return json.data ?? json;
}

/**
 * Admin: fetch all registrations from backend (bypasses browser RLS and connects to real DB).
 */
export async function getAdminRegistrations(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/registrations`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch registrations");
  }
  const json = await response.json();
  return json.data ?? json;
}

/**
 * Admin: update a team's status (approved, pending, rejected).
 */
export async function updateAdminTeamStatus(id: string, status: string): Promise<any> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/teams/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update team status");
  }
  const json = await response.json();
  return json.data ?? json;
}

/**
 * Admin: update full team details.
 */
export async function updateAdminTeam(id: string, teamData: any): Promise<any> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/teams/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teamData),
    },
  );
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update team details");
  }
  const json = await response.json();
  return json.data ?? json;
}

/**
 * Admin: delete team registration.
 */
export async function deleteAdminTeam(id: string): Promise<any> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/teams/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete team");
  }
  const json = await response.json();
  return json.data ?? json;
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
  const response = await fetch(`${API_BASE_URL}/api/admin/stats`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch stats");
  }
  const json = await response.json();
  return json.data ?? json;
}

/**
 * Admin: get event settings.
 */
export async function getAdminSettings(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/admin/settings`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch event settings");
  }
  const json = await response.json();
  return json.data ?? json;
}

/**
 * Admin: update event settings.
 */
export async function updateAdminSettings(settings: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update event settings");
  }
  const json = await response.json();
  return json.data ?? json;
}
