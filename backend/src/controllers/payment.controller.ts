import crypto from "node:crypto";
import type { Request, Response } from "express";
import { z } from "zod";
import { config } from "../config/env.js";
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
} from "../services/razorpay.service.js";
import {
  attachRazorpayOrder,
  createPendingRegistration,
  getTeamByOrderId,
  markTeamFailed,
  markTeamPaid,
  REGISTRATION_FEE_INR,
  REGISTRATION_FEE_PAISE,
} from "../services/registration.service.js";
import { sendRegistrationConfirmationEmail } from "../services/email.service.js";
import { errorResponse, successResponse } from "../utils/response.js";

const registrationSchema = z.object({
  team_name: z.string().trim().min(2, "Team name is required"),
  leader_name: z.string().trim().min(2, "Leader name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone required"),
  college: z.string().optional().default(""),
  team_size: z.coerce.number().min(1).max(5).default(2),
  ppt_url: z.string().optional().default(""),
  ppt_storage_path: z.string().optional(),
  ppt_file_name: z.string().optional(),
  ppt_file_type: z.string().optional(),
  ppt_file_size: z.coerce.number().optional(),
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

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1, "razorpay_order_id is required"),
  razorpay_payment_id: z.string().min(1, "razorpay_payment_id is required"),
  razorpay_signature: z.string().min(1, "razorpay_signature is required"),
  teamId: z.string().optional(),
});

/**
 * POST /api/payments/create-order or POST /api/payment/create-order
 * Validates registration and creates a pending Razorpay order
 */
export async function createOrder(req: Request, res: Response) {
  try {
    const parseResult = registrationSchema.safeParse(req.body);
    if (!parseResult.success) {
      return errorResponse(res, "Validation error", 400, parseResult.error.format());
    }

    const payload = parseResult.data;

    // 1. Create or retrieve pending record in Supabase
    const { teamId, playerId, cleanId } = await createPendingRegistration({
      ...payload,
      ppt_storage_path: payload.ppt_storage_path,
      ppt_file_name: payload.ppt_file_name,
      ppt_file_type: payload.ppt_file_type,
      ppt_file_size: payload.ppt_file_size,
    });

    // 2. Generate Razorpay order on server (amount always calculated server-side)
    const receipt = `rcpt_${cleanId.slice(0, 10)}_${Date.now().toString().slice(-4)}`;
    const rzpOrder = await createRazorpayOrder({
      amountPaise: REGISTRATION_FEE_PAISE,
      currency: "INR",
      receipt,
      notes: {
        team_id: teamId,
        player_id: playerId,
        team_name: payload.team_name,
        leader_name: payload.leader_name,
        email: payload.email,
      },
    });

    const razorpayOrderId = rzpOrder.id;

    // 3. Attach order id to team record
    await attachRazorpayOrder(teamId, razorpayOrderId);

    console.log(
      `[Payment Controller] Created Razorpay order ${razorpayOrderId} for Team ${payload.team_name} (Amount: ₹${REGISTRATION_FEE_INR})`,
    );

    return successResponse(res, {
      orderId: razorpayOrderId,
      amount: REGISTRATION_FEE_PAISE,
      amountInRupees: REGISTRATION_FEE_INR,
      currency: "INR",
      keyId: config.razorpay.keyId || process.env.VITE_RAZORPAY_KEY_ID || "",
      teamId,
      playerId,
      teamName: payload.team_name,
      leaderName: payload.leader_name,
      email: payload.email,
      phone: payload.phone,
    });
  } catch (err: any) {
    console.error("[Payment Controller] createOrder Error:", err);
    return errorResponse(res, err.message || "Failed to create payment order", 500);
  }
}

/**
 * POST /api/payments/verify or POST /api/payment/verify
 * Cryptographically verifies Razorpay HMAC-SHA256 signature and confirms registration
 */
export async function verifyPayment(req: Request, res: Response) {
  try {
    const parseResult = verifySchema.safeParse(req.body);
    if (!parseResult.success) {
      return errorResponse(res, "Invalid payment verification payload", 400, parseResult.error.format());
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parseResult.data;

    // 1. Find registration record
    const team = await getTeamByOrderId(razorpay_order_id);
    if (!team) {
      console.error(`[Payment Controller] Verification error: Team not found for order ${razorpay_order_id}`);
      return errorResponse(res, "Registration record not found for this order", 404);
    }

    // 2. Idempotency check: if already confirmed, return success immediately
    if (team.payment_status === "paid") {
      console.log(`[Payment Controller] Order ${razorpay_order_id} already marked as paid.`);
      return successResponse(res, {
        success: true,
        alreadyProcessed: true,
        status: "paid",
        playerId: team.player_id,
        teamName: team.team_name,
        orderId: razorpay_order_id,
        paymentId: team.payment_id,
      });
    }

    // 3. Secure HMAC-SHA256 signature verification
    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      console.warn(`[Payment Controller] Invalid signature detected for order ${razorpay_order_id}`);
      await markTeamFailed(razorpay_order_id);
      return errorResponse(res, "Payment signature verification failed", 400);
    }

    // 4. Update team record to paid and approved
    await markTeamPaid(razorpay_order_id, {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    });

    console.log(`[Payment Controller] Payment VERIFIED and confirmed for Team ${team.team_name} (${team.player_id})`);

    // 5. Trigger automated registration confirmation email
    sendRegistrationConfirmationEmail(team.id || razorpay_order_id).catch((emailErr) => {
      console.warn("[Payment Controller] Confirmation email trigger notice:", emailErr.message);
    });

    return successResponse(res, {
      success: true,
      status: "paid",
      playerId: team.player_id,
      teamName: team.team_name,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  } catch (err: any) {
    console.error("[Payment Controller] verifyPayment Error:", err);
    return errorResponse(res, err.message || "Failed to verify payment", 500);
  }
}

/**
 * GET /api/payment/order/:orderId or GET /api/payments/order/:orderId
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
      id: team.id,
      player_id: team.player_id,
      team_name: team.team_name,
      payment_status: team.payment_status,
      payment_amount: team.payment_amount,
      status: team.status,
      paid_at: team.paid_at,
    });
  } catch (err: any) {
    console.error("[Payment Controller] getOrder Error:", err);
    return errorResponse(res, err.message || "Failed to retrieve order", 500);
  }
}

/**
 * GET /api/registrations/:id/status
 */
export async function getRegistrationStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, "id parameter is required", 400);
    }

    const team = await getTeamByOrderId(id);
    if (!team) {
      return errorResponse(res, "Registration not found", 404);
    }

    return successResponse(res, {
      id: team.id,
      player_id: team.player_id,
      team_name: team.team_name,
      payment_status: team.payment_status,
      status: team.status,
      paid_at: team.paid_at,
    });
  } catch (err: any) {
    console.error("[Payment Controller] getRegistrationStatus Error:", err);
    return errorResponse(res, err.message || "Failed to retrieve status", 500);
  }
}

/**
 * POST /api/payments/webhook
 */
export async function handleWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers["x-razorpay-signature"] as string;
    const secret = config.razorpay.keySecret;

    if (secret && signature) {
      const body = (req as any).rawBody || JSON.stringify(req.body);
      const expected = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

      if (expected !== signature) {
        console.warn("[Razorpay Webhook] Invalid webhook signature");
        return errorResponse(res, "Invalid webhook signature", 400);
      }
    }

    const event = req.body;
    const eventName = event?.event;

    if (eventName === "order.paid" || eventName === "payment.captured") {
      const orderId = event.payload?.payment?.entity?.order_id || event.payload?.order?.entity?.id;
      const paymentId = event.payload?.payment?.entity?.id;

      if (orderId && paymentId) {
        await markTeamPaid(orderId, {
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
        });
        console.log(`[Razorpay Webhook] Order ${orderId} marked paid via webhook`);

        sendRegistrationConfirmationEmail(orderId).catch((emailErr) => {
          console.warn("[Razorpay Webhook] Confirmation email trigger notice:", emailErr.message);
        });
      }
    }

    return successResponse(res, { status: "OK" });
  } catch (err: any) {
    console.error("[Razorpay Webhook] Error:", err);
    return errorResponse(res, "Webhook processing error", 500);
  }
}
