import type { Request, Response } from "express";
import { supabase } from "../services/supabase.service.js";
import {
  deleteStoredTeam,
  getAllStoredTeams,
  getTeamByOrderId,
  updateStoredTeam,
} from "../services/registration.service.js";
import { sendRegistrationConfirmationEmail } from "../services/email.service.js";
import { errorResponse, successResponse } from "../utils/response.js";

const PPT_BUCKET = "apex-presentations";

/**
 * GET /api/admin/registrations
 */
export async function getRegistrations(req: Request, res: Response) {
  try {
    const { data: teams, error } = await supabase
      .from("teams")
      .select("*, team_members(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[Admin Controller] Supabase query note:", error.message);
      const fallback = getAllStoredTeams();
      return successResponse(res, fallback);
    }

    return successResponse(res, teams || []);
  } catch (err: any) {
    const fallback = getAllStoredTeams();
    return successResponse(res, fallback);
  }
}

/**
 * GET /api/admin/registrations/:id/ppt-url
 * Returns a 1-hour signed download URL for a team's private PPT/PDF.
 */
export async function getTeamPptSignedUrl(req: Request, res: Response) {
  try {
    const { id } = req.params;
    let team: any = null;

    const { data: dbTeam, error } = await supabase
      .from("teams")
      .select("id, ppt_storage_path, ppt_file_name, ppt_file_type")
      .eq("id", id)
      .maybeSingle();

    if (!error && dbTeam) {
      team = dbTeam;
    } else {
      team = await getTeamByOrderId(id);
    }

    if (!team) return errorResponse(res, "Team not found", 404);
    if (!team.ppt_storage_path) {
      return errorResponse(res, "No presentation file stored for this team", 404);
    }

    const { data, error: signErr } = await supabase.storage
      .from(PPT_BUCKET)
      .createSignedUrl(team.ppt_storage_path, 3600); // 1 hour

    if (signErr || !data?.signedUrl) {
      return errorResponse(res, "Failed to generate signed URL", 500);
    }

    return successResponse(res, {
      signedUrl: data.signedUrl,
      fileName: team.ppt_file_name,
      mimeType: team.ppt_file_type,
      expiresIn: 3600,
    });
  } catch (err: any) {
    return errorResponse(res, err.message, 500);
  }
}

/**
 * GET /api/admin/stats
 */
export async function getStats(_req: Request, res: Response) {
  try {
    const { data: teams, error } = await supabase
      .from("teams")
      .select("id, status, payment_status, team_size");

    const teamList: any[] = (!error && teams) ? teams : getAllStoredTeams();

    const totalTeams = teamList.length;
    const paidTeams = teamList.filter((t) => t.payment_status === "paid").length;
    const approvedTeams = teamList.filter((t) => t.status === "approved").length;
    const pendingTeams = teamList.filter((t) => t.status === "pending").length;
    const totalParticipants =
      teamList.reduce((acc, t) => acc + (Number(t.team_size) || 2), 0);

    return successResponse(res, {
      totalTeams,
      paidTeams,
      approvedTeams,
      pendingTeams,
      totalParticipants,
    });
  } catch (err: any) {
    return errorResponse(res, err.message, 500);
  }
}

/**
 * PATCH /api/admin/teams/:id/status
 */
export async function updateTeamStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return errorResponse(res, "Invalid status", 400);
    }

    const { data, error } = await supabase
      .from("teams")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      const fallback = updateStoredTeam(id, { status });
      if (fallback) return successResponse(res, fallback);
      return errorResponse(res, error.message, 500);
    }

    updateStoredTeam(id, { status });
    return successResponse(res, data);
  } catch (err: any) {
    const fallback = updateStoredTeam(req.params.id, { status: req.body?.status });
    if (fallback) return successResponse(res, fallback);
    return errorResponse(res, err.message, 500);
  }
}

/**
 * PUT /api/admin/teams/:id
 * Updates full team registration details from admin dialog.
 */
export async function updateTeam(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      team_name,
      leader_name,
      email,
      phone,
      college,
      team_size,
      status,
      preferred_domain,
    } = req.body;

    const payload = {
      ...(team_name !== undefined && { team_name }),
      ...(leader_name !== undefined && { leader_name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(college !== undefined && { college }),
      ...(team_size !== undefined && { team_size: Number(team_size) }),
      ...(status !== undefined && { status }),
      ...(preferred_domain !== undefined && { preferred_domain }),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("teams")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      const fallback = updateStoredTeam(id, payload);
      if (fallback) return successResponse(res, fallback);
      return errorResponse(res, error.message, 500);
    }

    updateStoredTeam(id, payload);
    return successResponse(res, data);
  } catch (err: any) {
    const fallback = updateStoredTeam(req.params.id, req.body);
    if (fallback) return successResponse(res, fallback);
    return errorResponse(res, err.message, 500);
  }
}

/**
 * DELETE /api/admin/teams/:id
 */
export async function deleteTeam(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("teams").delete().eq("id", id);
    deleteStoredTeam(id);

    if (error) {
      // If table doesn't exist yet, we still deleted from local memory
      return successResponse(res, { success: true, localOnly: true });
    }

    return successResponse(res, { success: true });
  } catch (err: any) {
    deleteStoredTeam(req.params.id);
    return successResponse(res, { success: true });
  }
}

/**
 * GET /api/admin/settings
 */
export async function getSettings(_req: Request, res: Response) {
  try {
    const { data, error } = await supabase
      .from("event_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      return errorResponse(res, error.message, 500);
    }

    return successResponse(res, data || {});
  } catch (err: any) {
    return errorResponse(res, err.message, 500);
  }
}

/**
 * POST /api/admin/settings
 */
export async function updateSettings(req: Request, res: Response) {
  try {
    const settings = req.body;

    const { data: existing } = await supabase
      .from("event_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      const { data, error } = await supabase
        .from("event_settings")
        .update(settings)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) return errorResponse(res, error.message, 500);
      return successResponse(res, data);
    } else {
      const { data, error } = await supabase
        .from("event_settings")
        .insert(settings)
        .select()
        .single();

      if (error) return errorResponse(res, error.message, 500);
      return successResponse(res, data);
    }
  } catch (err: any) {
    return errorResponse(res, err.message, 500);
  }
}

/**
 * POST /api/admin/registrations/:id/send-email
 * Allows admins to trigger/resend confirmation email to a participant.
 */
export async function sendAdminTeamEmail(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const force = req.query.force === "true" || req.body?.force === true;
    const result = await sendRegistrationConfirmationEmail(id, force);

    if (!result.success && result.error) {
      return errorResponse(res, result.error, 500);
    }

    return successResponse(res, result);
  } catch (err: any) {
    return errorResponse(res, err.message, 500);
  }
}

