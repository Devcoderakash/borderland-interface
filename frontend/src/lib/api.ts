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
