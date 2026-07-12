import type { Request, Response } from "express";
import { Order, type OrderStatus } from "../models/Order";
import { Product } from "../models/Product";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

function generateTrackingNumber(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `IP-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

export const SHIPPING_FLAT_RATE = 99;
export const FREE_SHIPPING_THRESHOLD = 999;

interface RawItem {
  productId?: string;
  product?: string;
  quantity?: number;
}

export async function buildOrderItems(items: RawItem[], { decrementStock }: { decrementStock: boolean }) {
  const orderItems = [];
  let itemsPrice = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId ?? item.product);
    if (!product || !product.isActive) {
      throw new ApiError(400, `Product not found or unavailable: ${item.productId}`);
    }
    const quantity = Number(item.quantity) || 1;
    if (product.stock < quantity) {
      throw new ApiError(400, `Insufficient stock for ${product.name}.`);
    }

    const unitPrice = product.discountPrice ?? product.price;
    itemsPrice += unitPrice * quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0],
      price: unitPrice,
      quantity,
    });

    if (decrementStock) {
      product.stock -= quantity;
      await product.save();
    }
  }

  const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  const totalPrice = itemsPrice + shippingPrice;

  return { orderItems, itemsPrice, shippingPrice, totalPrice };
}

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { items, shippingAddress, paymentMethod } = req.body ?? {};

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Order must include at least one item.");
  }
  if (!shippingAddress) {
    throw new ApiError(400, "Shipping address is required.");
  }

  const { orderItems, itemsPrice, shippingPrice, totalPrice } = await buildOrderItems(items, {
    decrementStock: true,
  });

  const order = await Order.create({
    user: req.user!._id,
    items: orderItems,
    shippingAddress,
    paymentMethod: paymentMethod ?? "cash_on_delivery",
    itemsPrice,
    shippingPrice,
    totalPrice,
    trackingNumber: generateTrackingNumber(),
    trackingHistory: [{ status: "pending", note: "Order placed.", date: new Date() }],
  });

  res.status(201).json({ order });
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({ user: req.user!._id }).sort({ createdAt: -1 });
  res.json({ orders });
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) throw new ApiError(404, "Order not found.");

  const isOwner = order.user._id.toString() === req.user!._id.toString();
  if (!isOwner && req.user!.role !== "admin") {
    throw new ApiError(403, "You do not have access to this order.");
  }

  res.json({ order });
});

export const getOrderTracking = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found.");

  const isOwner = order.user.toString() === req.user!._id.toString();
  if (!isOwner && req.user!.role !== "admin") {
    throw new ApiError(403, "You do not have access to this order.");
  }

  res.json({
    trackingNumber: order.trackingNumber,
    status: order.status,
    trackingHistory: order.trackingHistory,
  });
});

export const listAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  res.json({
    orders,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

const VALID_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, note } = req.body ?? {};

  if (!status || !VALID_STATUSES.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found.");

  order.status = status;
  order.trackingHistory.push({ status, note, date: new Date() });

  if (status === "delivered") {
    order.deliveredAt = new Date();
  }

  await order.save();
  res.json({ order });
});