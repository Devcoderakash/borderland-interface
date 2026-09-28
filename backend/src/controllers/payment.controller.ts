import type { Request, Response } from "express";
import { z } from "zod";
import { config } from "../config/env.js";
import {
  createCashfreeOrder,
  getCashfreeOrder,
  verifyCashfreeWebhookSignature,
} from "../services/cashfree.js";
import {
  createPendingRegistration,
  getTeamByOrderId,
  markTeamPaid,
  REGISTRATION_FEE_INR,
} from "../services/registration.service.js";
import { errorResponse, successResponse } from "../utils/response.js";

const registrationSchema = z.object({
  team_name: z.string().trim().min(2, "Team name is required"),
  leader_name: z.string().trim().min(2, "Leader name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone required"),
  college: z.string().optional().default(""),
  team_size: z.coerce.number().min(1).max(5).default(2),
  ppt_url: z.string().optional().default(""),
  preferred_domain: z.string().optional(),
  github_url: z.string().optional(),
  linkedin_url: z.string().optional(),
  members: z
    .array(
      z.object({
        full_name: z.string().min(1),
        position: z.number().default(1),
      }),
    )
    .optional()
    .default([]),
});

/**
 * POST /api/payment/create-order
 */
export async function createOrder(req: Request, res: Response) {
  try {
    const parseResult = registrationSchema.safeParse(req.body);
    if (!parseResult.success) {
      return errorResponse(res, "Validation error", 400, parseResult.error.format());
    }

    const payload = parseResult.data;

    // 1. Create pending record in Supabase
    const { teamId, playerId, cleanId, orderId } = await createPendingRegistration(payload);

    // 2. Prepare return and notify URLs
    const frontendBase = config.frontendUrl.replace(/\/$/, "");
    const returnUrl = `${frontendBase}/success?order_id={order_id}&team_id=${teamId}`;
    const notifyUrl = `${req.protocol}://${req.get("host")}/api/payment/webhook`;

    // 3. Create Cashfree Order if credentials are provided
    let paymentSessionId: string | null = null;
    let cfOrderId = "";

    if (config.cashfree.appId && config.cashfree.secretKey) {
      const cashfreeOrder = await createCashfreeOrder({
        orderId,
        orderAmount: REGISTRATION_FEE_INR,
        orderCurrency: "INR",
        customerDetails: {
          customerId: `cust_${cleanId}`,
          customerName: payload.leader_name,
          customerEmail: payload.email,
          customerPhone: payload.phone,
        },
        orderMeta: {
          returnUrl,
          notifyUrl,
        },
        orderNote: `APEX 1.0 Registration — Team ${payload.team_name}`,
      });

      paymentSessionId = cashfreeOrder.paymentSessionId;
      cfOrderId = cashfreeOrder.cfOrderId;
    } else {
      console.warn(
        "[Payment Controller] Cashfree credentials not configured. Generating mock session for testing.",
      );
      paymentSessionId = `mock_session_${cleanId}`;
    }

    return successResponse(res, {
      orderId,
      cfOrderId,
      paymentSessionId,
      amount: REGISTRATION_FEE_INR,
      currency: "INR",
      referenceId: teamId,
      playerId,
      environment: config.cashfree.environment,
    });
  } catch (err: any) {
    console.error("[Payment Controller] createOrder Error:", err);
    return errorResponse(res, err.message || "Failed to create payment order", 500);
  }
}

/**
 * POST /api/payment/verify
 */
export async function verifyPayment(req: Request, res: Response) {
  try {
    const { orderId, referenceId } = req.body;
    if (!orderId) {
      return errorResponse(res, "orderId is required", 400);
    }

    if (!config.cashfree.appId || !config.cashfree.secretKey) {
      // Development mode fallback
      await markTeamPaid(orderId, { payment_id: `dev_paid_${Date.now()}` });
      return successResponse(res, {
        success: true,
        orderId,
        status: "PAID",
      });
    }

    const orderData = await getCashfreeOrder(orderId);
    const orderStatus = orderData.order_status;

    if (orderStatus === "PAID") {
      await markTeamPaid(orderId, orderData);
      return successResponse(res, {
        success: true,
        orderId,
        status: "PAID",
      });
    }

    return successResponse(res, {
      success: false,
      orderId,
      status: orderStatus,
    });
  } catch (err: any) {
    console.error("[Payment Controller] verifyPayment Error:", err);
    return errorResponse(res, err.message || "Failed to verify payment", 500);
  }
}

/**
 * GET /api/payment/order/:orderId
 */
export async function getOrder(req: Request, res: Response) {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return errorResponse(res, "orderId parameter is required", 400);
    }

    const team = await getTeamByOrderId(orderId);
    if (!team) {
      return errorResponse(res, "Order not found", 404);
    }

    return successResponse(res, {
      player_id: team.player_id,
      team_name: team.team_name,
      payment_status: team.payment_status,
      status: team.status,
    });
  } catch (err: any) {
    console.error("[Payment Controller] getOrder Error:", err);
    return errorResponse(res, err.message || "Failed to retrieve order", 500);
  }
}

/**
 * POST /api/payment/webhook
 */
export async function handleWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers["x-webhook-signature"] as string;
    const timestamp = req.headers["x-webhook-timestamp"] as string;
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    if (config.cashfree.secretKey && !verifyCashfreeWebhookSignature(rawBody, signature, timestamp)) {
      console.warn("[Payment Webhook] Invalid webhook signature rejected.");
      return errorResponse(res, "Invalid signature", 400);
    }

    const event = req.body;
    const eventType = event?.type;
    const orderId = event?.data?.order?.order_id;

    if (eventType === "PAYMENT_SUCCESS_WEBHOOK" && orderId) {
      await markTeamPaid(orderId, event.data.payment || {});
      console.log(`[Payment Webhook] Marked order ${orderId} as PAID`);
    }

    return successResponse(res, { status: "OK" });
  } catch (err: any) {
    console.error("[Payment Webhook] Error:", err);
    return errorResponse(res, "Webhook processing error", 500);
  }
}
