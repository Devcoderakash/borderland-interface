import { Router } from "express";
import {
  deleteTeam,
  getRegistrations,
  getSettings,
  getStats,
  getTeamPptSignedUrl,
  updateSettings,
  updateTeam,
  updateTeamStatus,
} from "../controllers/admin.controller.js";
import { authenticateAdmin } from "../middleware/auth.middleware.js";

export const adminRouter = Router();

adminRouter.use(authenticateAdmin);

adminRouter.get("/registrations", getRegistrations);
adminRouter.get("/registrations/:id/ppt-url", getTeamPptSignedUrl);
adminRouter.get("/stats", getStats);
adminRouter.patch("/teams/:id/status", updateTeamStatus);
adminRouter.put("/teams/:id", updateTeam);
adminRouter.delete("/teams/:id", deleteTeam);
adminRouter.get("/settings", getSettings);
adminRouter.post("/settings", updateSettings);
