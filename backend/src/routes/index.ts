import { Router } from "express";
import { adminRouter } from "./admin.routes.js";
import { paymentRouter } from "./payment.routes.js";
import { registrationRouter } from "./registration.routes.js";

export const apiRouter = Router();

// Health check
apiRouter.get("/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Payments
apiRouter.use("/payment", paymentRouter);
apiRouter.use("/payments", paymentRouter);

// Registrations
apiRouter.use("/registration", registrationRouter);
apiRouter.use("/registrations", registrationRouter);

// Admin
apiRouter.use("/admin", adminRouter);
