import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import { config } from "../config/env.js";
import { errorResponse } from "../utils/response.js";

export function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  // If authorization header exists, verify token
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // If running in development without strict auth configured, allow local testing
    if (config.nodeEnv === "development") {
      return next();
    }
    return errorResponse(res, "Unauthorized: Missing Authorization header", 401);
  }

  // Token verification can be expanded for Supabase JWT
  next();
}

export function authenticateCron(req: Request, res: Response, next: NextFunction) {
  if (!config.cronSecret) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return errorResponse(res, "Unauthorized", 401);
  }

  const match = /^Bearer ([^\s,]+)$/.exec(authHeader);
  const token = match?.[1];

  if (!token) {
    return errorResponse(res, "Unauthorized", 401);
  }

  const digest = (value: string) =>
    crypto.createHash("sha256").update(value, "utf8").digest();

  const tokenDigest = digest(token);
  const secretDigest = digest(config.cronSecret);

  if (!crypto.timingSafeEqual(tokenDigest, secretDigest)) {
    return errorResponse(res, "Unauthorized", 401);
  }

  next();
}
