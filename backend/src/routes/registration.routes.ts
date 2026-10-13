import { Router } from "express";
import {
  createOrder,
  getRegistrationStatus,
} from "../controllers/payment.controller.js";
import { getRegistration } from "../controllers/registration.controller.js";

export const registrationRouter = Router();

// POST /api/registrations — validate and create a pending registration
registrationRouter.post("/", createOrder);

// GET /api/registrations/:id/status — retrieve the registration and payment status securely
registrationRouter.get("/:id/status", getRegistrationStatus);

// GET /api/registrations/:id — retrieve full registration details
registrationRouter.get("/:id", getRegistration);
