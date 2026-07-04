import type { NextFunction, Request, Response } from "express";
import { User, type IUser } from "../models/User";
import { verifyToken, COOKIE_NAME } from "../utils/generateToken";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

function extractToken(req: Request): string | undefined {
  const cookieToken = req.cookies?.[COOKIE_NAME];
  if (cookieToken) return cookieToken;

  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length);
  }

  return undefined;
}

export const protect = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractToken(req);

    if (!token) {
      throw new ApiError(401, "Not authenticated. Please log in.");
    }

    let payload: { sub: string };
    try {
      payload = verifyToken(token);
    } catch {
      throw new ApiError(401, "Invalid or expired session. Please log in again.");
    }

    const user = await User.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new ApiError(401, "Account not found or deactivated.");
    }

    req.user = user;
    next();
  },
);

export function adminOnly(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    throw new ApiError(403, "Admin access required.");
  }
  next();
}
