import { Router } from "express";
import {
  checkEmailStatus,
  retryConfirmationEmail,
  triggerConfirmationEmail,
} from "../controllers/email.controller.js";

const router = Router();

// Trigger automated registration confirmation email
router.post("/send-confirmation", triggerConfirmationEmail);

// Check delivery status
router.get("/status/:id", checkEmailStatus);

// Force retry
router.post("/retry/:id", retryConfirmationEmail);

export const emailRouter = router;
