import { Router } from "express";
import {
  createOrder,
  getOrder,
  handleWebhook,
  verifyPayment,
} from "../controllers/payment.controller.js";

export const paymentRouter = Router();

// Payment & Checkout endpoints
paymentRouter.post("/create-order", createOrder);
paymentRouter.post("/verify", verifyPayment);
paymentRouter.get("/order/:orderId", getOrder);
paymentRouter.post("/webhook", handleWebhook);
