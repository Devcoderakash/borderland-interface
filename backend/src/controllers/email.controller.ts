/**
 * Controller for APEX automated registration confirmation emails.
 */

import { Request, Response } from "express";
import { z } from "zod";
import {
  getEmailDeliveryStatus,
  sendRegistrationConfirmationEmail,
} from "../services/email.service.js";

const sendEmailSchema = z.object({
  teamId: z.string().optional(),
  playerId: z.string().optional(),
  orderId: z.string().optional(),
  forceRetry: z.boolean().optional().default(false),
});

export async function triggerConfirmationEmail(req: Request, res: Response) {
  try {
    const parsed = sendEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid request payload",
        details: parsed.error.format(),
      });
    }

    const { teamId, playerId, orderId, forceRetry } = parsed.data;
    const identifier = teamId || playerId || orderId;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        error: "Please provide a teamId, playerId, or orderId.",
      });
    }

    const result = await sendRegistrationConfirmationEmail(identifier, forceRetry);

    if (!result.success && result.error) {
      return res.status(500).json({
        success: false,
        error: result.error,
        data: result,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.alreadySent
        ? "Confirmation email was already delivered."
        : "Confirmation email sent successfully.",
      data: result,
    });
  } catch (err: any) {
    console.error("[Email Controller] triggerConfirmationEmail error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to trigger confirmation email.",
    });
  }
}

export async function checkEmailStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: "Missing identifier" });
    }

    const status = await getEmailDeliveryStatus(id);
    return res.status(200).json({
      success: true,
      data: status || { status: "not_sent" },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to check email delivery status.",
    });
  }
}

export async function retryConfirmationEmail(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: "Missing identifier" });
    }

    const result = await sendRegistrationConfirmationEmail(id, true);

    if (!result.success && result.error) {
      return res.status(500).json({
        success: false,
        error: result.error,
        data: result,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Confirmation email retried successfully.",
      data: result,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to retry confirmation email.",
    });
  }
}
