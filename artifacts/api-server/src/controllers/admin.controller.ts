import type { Request, Response } from "express";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";

export const getAnalyticsSummary = asyncHandler(async (_req: Request, res: Response) => {
  const [totalRevenueAgg, totalOrders, totalCustomers, totalProducts, lowStockCount, pendingOrders] =
    await Promise.all([
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      Order.countDocuments(),
      User.countDocuments({ role: "customer" }),
      Product.countDocuments(),
      Product.countDocuments({ $expr: { $lte: ["$stock", "$lowStockThreshold"] } }),
      Order.countDocuments({ status: "pending" }),
    ]);

  res.json({
    totalRevenue: totalRevenueAgg[0]?.total ?? 0,
    totalOrders,
    totalCustomers,
    totalProducts,
    lowStockCount,
    pendingOrders,
  });
});

export const getSalesOverTime = asyncHandler(async (req: Request, res: Response) => {
  const days = Math.min(90, Math.max(7, Number(req.query.days) || 30));
  const since = new Date();
  since.setDate(since.getDate() - days);

  const sales = await Order.aggregate([
    { $match: { createdAt: { $gte: since }, status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$totalPrice" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    sales: sales.map((s) => ({ date: s._id, revenue: s.revenue, orders: s.orders })),
  });
});

export const getTopProducts = asyncHandler(async (_req: Request, res: Response) => {
  const topProducts = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        name: { $first: "$items.name" },
        unitsSold: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { unitsSold: -1 } },
    { $limit: 10 },
  ]);

  res.json({ topProducts });
});

export const getOrderStatusBreakdown = asyncHandler(async (_req: Request, res: Response) => {
  const breakdown = await Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  res.json({
    breakdown: breakdown.map((b) => ({ status: b._id, count: b.count })),
  });
});
