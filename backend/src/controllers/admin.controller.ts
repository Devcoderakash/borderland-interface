import type { Request, Response } from "express";
import { supabase } from "../services/supabase.service.js";
import { errorResponse, successResponse } from "../utils/response.js";

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
      return errorResponse(res, error.message, 500);
    }

    return successResponse(res, teams || []);
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

    if (error) {
      return errorResponse(res, error.message, 500);
    }

    const totalTeams = teams?.length || 0;
    const paidTeams = teams?.filter((t) => t.payment_status === "paid").length || 0;
    const approvedTeams = teams?.filter((t) => t.status === "approved").length || 0;
    const pendingTeams = teams?.filter((t) => t.status === "pending").length || 0;
    const totalParticipants =
      teams?.reduce((acc, t) => acc + (Number(t.team_size) || 2), 0) || 0;

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
      return errorResponse(res, error.message, 500);
    }

    return successResponse(res, data);
  } catch (err: any) {
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
    if (error) {
      return errorResponse(res, error.message, 500);
    }

    return successResponse(res, { success: true });
  } catch (err: any) {
    return errorResponse(res, err.message, 500);
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
