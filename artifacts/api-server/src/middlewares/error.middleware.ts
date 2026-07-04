import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { logger } from "../lib/logger";

export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err && typeof err === "object" && "name" in err && err.name === "ValidationError") {
    res.status(400).json({ error: (err as Error).message });
    return;
  }

  if (err && typeof err === "object" && "code" in err && (err as { code?: number }).code === 11000) {
    res.status(409).json({ error: "A record with these details already exists." });
    return;
  }

  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
}
