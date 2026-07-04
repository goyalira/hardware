import type { Request, Response } from "express";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { signToken, setAuthCookie, clearAuthCookie } from "../utils/generateToken";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body ?? {};

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required.");
  }

  if (typeof password !== "string" || password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters.");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const user = await User.create({ name, email, password, phone });
  const token = signToken(user._id.toString());
  setAuthCookie(res, token);

  res.status(201).json({ user, token });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (!user.isActive) {
    throw new ApiError(403, "This account has been deactivated.");
  }

  const token = signToken(user._id.toString());
  setAuthCookie(res, token);

  res.json({ user, token });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out successfully." });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  res.json({ user: req.user });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, addresses } = req.body ?? {};

  const user = req.user!;
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (addresses !== undefined) user.addresses = addresses;

  await user.save();
  res.json({ user });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body ?? {};

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current and new password are required.");
  }
  if (typeof newPassword !== "string" || newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters.");
  }

  const user = await User.findById(req.user!._id).select("+password");
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect.");
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: "Password updated successfully." });
});
