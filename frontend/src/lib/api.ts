/**
 * Frontend API client for communicating with the backend server.
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
  cfOrderId?: string;
  paymentSessionId: string | null;
  amount: number;
  currency: string;
  referenceId: string;
  playerId: string;
  environment: "sandbox" | "production";
}

export async function createOrder(
  data: CreateOrderPayload,
): Promise<PaymentOrderResponse> {
  const response = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
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

  return responseData;
}

export async function verifyPayment(params: {
  orderId: string;
  referenceId?: string;
}): Promise<{ success: boolean; status: string; orderId: string }> {
  const response = await fetch(`${API_BASE_URL}/api/payment/verify`, {
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

  return responseData;
}

export async function getTeamByOrderId(
  orderId: string,
): Promise<{ player_id: string; team_name: string; payment_status: string } | null> {
  const response = await fetch(
    `${API_BASE_URL}/api/payment/order/${encodeURIComponent(orderId)}`,
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

  return await response.json();
}
