import type { Request, Response } from "express";
import { supabase } from "../services/supabase.service.js";
import { errorResponse, successResponse } from "../utils/response.js";

/**
 * GET /api/registration/:id
 */
export async function getRegistration(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { data: team, error } = await supabase
      .from("teams")
      .select("*, team_members(*)")
      .or(`id.eq.${id},player_id.eq.${id}`)
      .maybeSingle();

    if (error) {
      return errorResponse(res, error.message, 500);
    }

    if (!team) {
      return errorResponse(res, "Team not found", 404);
    }

    return successResponse(res, team);
  } catch (err: any) {
    return errorResponse(res, err.message, 500);
  }
}
