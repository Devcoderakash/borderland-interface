import { Router } from "express";
import { createOrder } from "../controllers/payment.controller.js";
import { getRegistration } from "../controllers/registration.controller.js";

export const registrationRouter = Router();

registrationRouter.post("/", createOrder);
registrationRouter.get("/:id", getRegistration);
