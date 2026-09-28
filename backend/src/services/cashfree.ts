import crypto from "node:crypto";
import { config } from "../config/env.js";

export interface CreateCashfreeOrderInput {
  orderId: string;
  orderAmount: number; // in INR e.g. 150.00
  orderCurrency?: string;
  customerDetails: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  orderMeta?: {
    returnUrl?: string;
    notifyUrl?: string;
  };
  orderNote?: string;
}

export interface CashfreeOrderResult {
  cfOrderId: string;
  orderId: string;
  paymentSessionId: string;
  orderStatus: string;
}

export function getCashfreeBaseUrl(): string {
  return config.cashfree.environment === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
}

/**
 * Creates a Cashfree payment order via the PG v2023-08-01 API
 */
export async function createCashfreeOrder(
  input: CreateCashfreeOrderInput,
): Promise<CashfreeOrderResult> {
  if (!config.cashfree.appId || !config.cashfree.secretKey) {
    console.warn(
      "[Cashfree] CASHFREE_APP_ID or CASHFREE_SECRET_KEY is missing. Please set them in your backend .env file.",
    );
    throw new Error(
      "Cashfree credentials missing. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in backend environment variables.",
    );
  }

  const baseUrl = getCashfreeBaseUrl();
  const cleanPhone = input.customerDetails.customerPhone.replace(/\D/g, "").slice(-10);
  const validPhone = cleanPhone.length === 10 ? cleanPhone : "9999999999";

  const payload: Record<string, any> = {
    order_id: input.orderId,
    order_amount: Number(input.orderAmount.toFixed(2)),
    order_currency: input.orderCurrency || "INR",
    customer_details: {
      customer_id: input.customerDetails.customerId,
      customer_name: input.customerDetails.customerName,
      customer_email: input.customerDetails.customerEmail,
      customer_phone: validPhone,
    },
    order_note: input.orderNote || "APEX 1.0 Hackathon Registration",
  };

  if (input.orderMeta) {
    payload["order_meta"] = {};
    if (input.orderMeta.returnUrl) {
      payload["order_meta"]["return_url"] = input.orderMeta.returnUrl;
    }
    if (input.orderMeta.notifyUrl) {
      payload["order_meta"]["notify_url"] = input.orderMeta.notifyUrl;
    }
  }

  const response = await fetch(`${baseUrl}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": config.cashfree.appId,
      "x-client-secret": config.cashfree.secretKey,
      "x-api-version": config.cashfree.apiVersion,
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorMsg =
      responseData?.message || responseData?.error || `Cashfree API error HTTP ${response.status}`;
    console.error("[Cashfree] Order creation error:", responseData);
    throw new Error(errorMsg);
  }

  return {
    cfOrderId: String(responseData.cf_order_id || ""),
    orderId: String(responseData.order_id || input.orderId),
    paymentSessionId: String(responseData.payment_session_id || ""),
    orderStatus: String(responseData.order_status || "ACTIVE"),
  };
}

/**
 * Fetches order details directly from Cashfree to verify payment status
 */
export async function getCashfreeOrder(orderId: string): Promise<any> {
  if (!config.cashfree.appId || !config.cashfree.secretKey) {
    throw new Error("Cashfree credentials missing in backend environment variables.");
  }

  const baseUrl = getCashfreeBaseUrl();
  const response = await fetch(`${baseUrl}/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: {
      "x-client-id": config.cashfree.appId,
      "x-client-secret": config.cashfree.secretKey,
      "x-api-version": config.cashfree.apiVersion,
    },
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorMsg = responseData?.message || `Cashfree order fetch error HTTP ${response.status}`;
    console.error("[Cashfree] Get order error:", responseData);
    throw new Error(errorMsg);
  }

  return responseData;
}

/**
 * Validates the authenticity of an incoming Cashfree webhook using HMAC-SHA256 signature
 */
export function verifyCashfreeWebhookSignature(
  rawBody: string,
  signature: string | null,
  timestamp: string | null,
): boolean {
  if (!signature || !timestamp) {
    return false;
  }

  if (!config.cashfree.secretKey) {
    console.error("[Cashfree] Cannot verify webhook signature: CASHFREE_SECRET_KEY missing.");
    return false;
  }

  try {
    const signatureData = timestamp + rawBody;
    const computedSignature = crypto
      .createHmac("sha256", config.cashfree.secretKey)
      .update(signatureData)
      .digest("base64");

    const computedBuffer = Buffer.from(computedSignature);
    const signatureBuffer = Buffer.from(signature);

    if (computedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(computedBuffer, signatureBuffer);
  } catch (err) {
    console.error("[Cashfree] Error during webhook signature verification:", err);
    return false;
  }
}
