import type { Response } from "express";

export function successResponse(res: Response, data: any, status = 200) {
  return res.status(status).json(data);
}

export function errorResponse(res: Response, message: string, status = 500, details?: any) {
  return res.status(status).json({
    error: message,
    ...(details ? { details } : {}),
  });
}
