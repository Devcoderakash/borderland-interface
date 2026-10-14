import { Router } from "express";
import { adminRouter } from "./admin.routes.js";
import { paymentRouter } from "./payment.routes.js";
import { registrationRouter } from "./registration.routes.js";
import { uploadRouter } from "./upload.routes.js";
import { emailRouter } from "./email.routes.js";

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

// Uploads
apiRouter.use("/upload", uploadRouter);

// Automated Confirmation Emails
apiRouter.use("/email", emailRouter);
apiRouter.use("/emails", emailRouter);

