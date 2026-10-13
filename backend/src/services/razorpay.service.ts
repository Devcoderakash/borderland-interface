import crypto from "node:crypto";
import Razorpay from "razorpay";
import { config } from "../config/env.js";

let razorpayInstance: Razorpay | null = null;

export function getRazorpayClient(): Razorpay | null {
  if (config.razorpay.keyId && config.razorpay.keySecret) {
    if (!razorpayInstance) {
      razorpayInstance = new Razorpay({
        key_id: config.razorpay.keyId,
        key_secret: config.razorpay.keySecret,
      });
    }
    return razorpayInstance;
  }
  return null;
}

export interface CreateOrderParams {
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export async function createRazorpayOrder(params: CreateOrderParams) {
  const razorpay = getRazorpayClient();

  if (!razorpay) {
    // If keys not set yet, simulate test order id so development doesn't crash
    console.warn(
      "[Razorpay Service] Razorpay credentials missing in env. Simulating test order.",
    );
    return {
      id: `order_test_${params.receipt.slice(0, 14)}`,
      entity: "order",
      amount: params.amountPaise,
      amount_paid: 0,
      amount_due: params.amountPaise,
      currency: params.currency || "INR",
      receipt: params.receipt,
      status: "created",
      created_at: Math.floor(Date.now() / 1000),
      isMock: true,
    };
  }

  const orderOptions = {
    amount: params.amountPaise,
    currency: params.currency || "INR",
    receipt: params.receipt,
    notes: params.notes || {},
  };

  const order = await razorpay.orders.create(orderOptions);
  return { ...order, isMock: false };
}

export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = config.razorpay.keySecret;
  if (!secret) {
    console.warn(
      "[Razorpay Service] RAZORPAY_KEY_SECRET missing. Development verification pass-through.",
    );
    return true;
  }

  try {
    const payload = `${params.orderId}|${params.paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf-8");
    const actualBuf = Buffer.from(params.signature, "utf-8");

    if (expectedBuf.length !== actualBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  } catch (err) {
    console.error("[Razorpay Service] Error verifying signature:", err);
    return false;
  }
}
