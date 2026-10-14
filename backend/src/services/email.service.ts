/**
 * APEX//1.0 Automated Registration Confirmation Email Service
 * Handles:
 * 1. Fetching verified registration details from Supabase
 * 2. Idempotency & duplicate prevention
 * 3. Multi-provider delivery (Resend API + Nodemailer Gmail SMTP + Simulated Dev Fallback)
 * 4. Audit logging into database (public.registration_emails)
 * 5. Safe failure handling without breaking registration workflows
 */

import nodemailer from "nodemailer";
import { Resend } from "resend";
import { config } from "../config/env.js";
import { supabase } from "./supabase.service.js";
import {
  EmailRegistrationData,
  generateRegistrationConfirmationEmail,
} from "./email-template.js";
import { getTeamByOrderId } from "./registration.service.js";

export interface SendEmailResult {
  success: boolean;
  provider: "resend" | "smtp" | "simulated";
  messageId?: string;
  recipient: string;
  playerId: string;
  alreadySent?: boolean;
  error?: string;
}

// In-memory cache to guarantee idempotency across rapid double-clicks
const emailSentCache = new Set<string>();

/**
 * Send an automated registration confirmation email to the team leader.
 * Idempotent: will not send duplicates unless forceRetry is true.
 */
export async function sendRegistrationConfirmationEmail(
  identifier: string,
  forceRetry = false,
): Promise<SendEmailResult> {
  // 1. Fetch registration from Supabase / memory store
  const team = await getTeamByOrderId(identifier);
  if (!team) {
    return {
      success: false,
      provider: "simulated",
      recipient: "",
      playerId: identifier,
      error: `Registration record not found for identifier: ${identifier}`,
    };
  }

  const teamId = team.id;
  const playerId = team.player_id || identifier;
  const recipientEmail = team.email?.trim();

  if (!recipientEmail || !recipientEmail.includes("@")) {
    return {
      success: false,
      provider: "simulated",
      recipient: recipientEmail || "",
      playerId,
      error: `Invalid or missing recipient email for team: ${team.team_name}`,
    };
  }

  // 2. Check Idempotency: Has email already been sent?
  const teamCacheKey = `${teamId}_registration_confirmation`;
  const playerCacheKey = `${playerId}_registration_confirmation`;

  if (!forceRetry) {
    if (emailSentCache.has(teamCacheKey) || emailSentCache.has(playerCacheKey)) {
      console.log(`[Email Service] Confirmation email already sent for team ${playerId} (memory cache).`);
      return {
        success: true,
        provider: "simulated",
        recipient: recipientEmail,
        playerId,
        alreadySent: true,
      };
    }

    try {
      const { data: existingLog } = await supabase
        .from("registration_emails")
        .select("id, status, provider_message_id")
        .eq("team_id", teamId)
        .eq("email_type", "registration_confirmation")
        .eq("status", "sent")
        .maybeSingle();

      if (existingLog) {
        emailSentCache.add(teamCacheKey);
        emailSentCache.add(playerCacheKey);
        console.log(`[Email Service] Confirmation email already sent for team ${playerId} (DB log).`);
        return {
          success: true,
          provider: "resend",
          messageId: existingLog.provider_message_id,
          recipient: recipientEmail,
          playerId,
          alreadySent: true,
        };
      }
    } catch {
      // If table does not exist yet, continue safely
    }
  }

  // 3. Prepare email data
  const emailData: EmailRegistrationData = {
    playerId,
    teamName: team.team_name,
    leaderName: team.leader_name,
    email: recipientEmail,
    phone: team.phone,
    college: team.college,
    teamSize: Number(team.team_size) || 1,
    members: Array.isArray(team.team_members) ? team.team_members : [],
    preferredDomain: team.preferred_domain,
    pptFileName: team.ppt_file_name,
    pptStoragePath: team.ppt_storage_path,
    pptUrl: team.ppt_url,
    paymentStatus: team.payment_status,
    paymentAmount: team.payment_amount,
    paymentId: team.payment_id,
    orderId: team.razorpay_order_id,
  };

  const { subject, html, text } = generateRegistrationConfirmationEmail(emailData);

  let providerUsed: "resend" | "smtp" | "simulated" = "simulated";
  let messageId = "";
  let sendError: string | null = null;

  // 4. Provider Dispatch Strategy
  // Priority 1: Resend API
  if (config.email.resendApiKey && config.email.resendApiKey.startsWith("re_")) {
    try {
      const resend = new Resend(config.email.resendApiKey);
      const resendResponse = await resend.emails.send({
        from: `${config.email.senderName} <${config.email.senderEmail}>`,
        to: [recipientEmail],
        replyTo: config.email.replyTo,
        subject,
        html,
        text,
      });

      if (resendResponse.error) {
        throw new Error(resendResponse.error.message);
      }

      messageId = resendResponse.data?.id || `resend_${Date.now()}`;
      providerUsed = "resend";
      console.log(`[Email Service] Delivered via Resend to ${recipientEmail} (ID: ${messageId})`);
    } catch (resendErr: any) {
      console.warn("[Email Service] Resend attempt error, falling back to SMTP:", resendErr.message);
      sendError = resendErr.message;
    }
  }

  // Priority 2: Nodemailer (Gmail SMTP or custom SMTP)
  if (!messageId && config.email.smtp.pass) {
    try {
      const transporter = nodemailer.createTransport({
        host: config.email.smtp.host,
        port: config.email.smtp.port,
        secure: config.email.smtp.secure,
        auth: {
          user: config.email.smtp.user,
          pass: config.email.smtp.pass,
        },
      });

      const info = await transporter.sendMail({
        from: `"${config.email.senderName}" <${config.email.senderEmail}>`,
        to: recipientEmail,
        replyTo: config.email.replyTo,
        subject,
        html,
        text,
      });

      messageId = info.messageId || `smtp_${Date.now()}`;
      providerUsed = "smtp";
      sendError = null;
      console.log(`[Email Service] Delivered via SMTP to ${recipientEmail} (ID: ${messageId})`);
    } catch (smtpErr: any) {
      console.error("[Email Service] SMTP delivery failed:", smtpErr.message);
      sendError = smtpErr.message;
    }
  }

  // Priority 3: Simulated Development Delivery
  // If neither provider is active (e.g. testing without live credentials), simulate successful generation
  if (!messageId) {
    if (!sendError) {
      messageId = `sim_apex_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      providerUsed = "simulated";
      console.log(
        `[Email Service] Simulated email generated for ${recipientEmail} (${playerId}) | Subject: ${subject}`,
      );
    }
  }

  const isSuccess = Boolean(messageId);
  if (isSuccess) {
    emailSentCache.add(teamCacheKey);
    emailSentCache.add(playerCacheKey);
    if (team.razorpay_order_id) {
      emailSentCache.add(`${team.razorpay_order_id}_registration_confirmation`);
    }
  }

  // 5. Audit Logging to Supabase
  try {
    const logPayload = {
      team_id: teamId,
      player_id: playerId,
      recipient_email: recipientEmail,
      email_type: "registration_confirmation",
      provider: providerUsed,
      provider_message_id: messageId || null,
      status: isSuccess ? "sent" : "failed",
      attempt_count: 1,
      last_error: sendError ? sendError.slice(0, 500) : null,
      sent_at: isSuccess ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    await supabase
      .from("registration_emails")
      .upsert(logPayload, { onConflict: "team_id,email_type" });
  } catch (logErr: any) {
    console.warn("[Email Service] Audit log notice (schema pending):", logErr.message);
  }

  return {
    success: isSuccess,
    provider: providerUsed,
    messageId: messageId || undefined,
    recipient: recipientEmail,
    playerId,
    error: sendError || undefined,
  };
}

/**
 * Check the confirmation email delivery status for a given team.
 */
export async function getEmailDeliveryStatus(identifier: string) {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    let query = supabase.from("registration_emails").select("*");
    if (isUuid) {
      query = query.or(`team_id.eq.${identifier},player_id.eq.${identifier}`);
    } else {
      query = query.eq("player_id", identifier);
    }
    const { data } = await query.maybeSingle();
    if (data) return data;
  } catch {}

  for (const key of emailSentCache) {
    if (key.includes(identifier)) {
      return { status: "sent", provider: "cached" };
    }
  }

  return null;
}
