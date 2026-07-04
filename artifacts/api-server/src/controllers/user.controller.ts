import type { Request, Response } from "express";
import { User } from "../models/User";
import { Order } from "../models/Order";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const { search, page = "1", limit = "20" } = req.query as Record<string, string>;

  const filter: Record<string, unknown> = { role: "customer" };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(filter),
  ]);

  res.json({
    users,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found.");

  const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
  res.json({ user, orders });
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { isActive } = req.body ?? {};
  if (typeof isActive !== "boolean") {
    throw new ApiError(400, "isActive must be a boolean.");
  }

  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
  if (!user) throw new ApiError(404, "User not found.");

  res.json({ user });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, "User not found.");
  res.json({ message: "User deleted." });
});
