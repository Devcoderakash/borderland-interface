import cors from "cors";
import express from "express";
import { config } from "./config/env.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { apiRouter } from "./routes/index.js";

const app = express();

// Middleware: CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl) or any localhost origin
      if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow configured origins in development
      }
    },
    credentials: true,
  }),
);

// Middleware: JSON parser with rawBody preservation for webhooks
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString();
    },
  }),
);

// URL encoded body parser
app.use(express.urlencoded({ extended: true }));

// Root health check
app.get("/", (_req, res) => {
  res.json({
    name: "APEX 1.0 Backend API",
    status: "online",
    endpoints: {
      health: "/api/health",
      payment: "/api/payment",
      registration: "/api/registration",
      admin: "/api/admin",
    },
  });
});

// Mount API routes
app.use("/api", apiRouter);

// Central error handler
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`[APEX Backend] Server running on http://localhost:${config.port}`);
  console.log(`[APEX Backend] Mode: ${config.nodeEnv}`);
});

export default app;
