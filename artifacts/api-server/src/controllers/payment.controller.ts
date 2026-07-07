import type { Request, Response } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { Order } from "../models/Order";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { buildOrderItems } from "./order.controller";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

function generateTrackingNumber(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `IP-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

export const createRazorpayOrder = asyncHandler(async (req: Request, res: Response) => {
  const { items } = req.body ?? {};

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Order must include at least one item.");
  }

  const { totalPrice } = await buildOrderItems(items, { decrementStock: false });

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(totalPrice * 100), // Razorpay expects amount in paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  });

  res.json({
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
});

export const verifyRazorpayPayment = asyncHandler(async (req: Request, res: Response) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    items,
    shippingAddress,
  } = req.body ?? {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Missing payment verification details.");
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Order must include at least one item.");
  }
  if (!shippingAddress) {
    throw new ApiError(400, "Shipping address is required.");
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, "Payment verification failed.");
  }

  const { orderItems, itemsPrice, shippingPrice, totalPrice } = await buildOrderItems(items, {
    decrementStock: true,
  });

  const order = await Order.create({
    user: req.user!._id,
    items: orderItems,
    shippingAddress,
    paymentMethod: "card",
    itemsPrice,
    shippingPrice,
    totalPrice,
    isPaid: true,
    paidAt: new Date(),
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    trackingNumber: generateTrackingNumber(),
    trackingHistory: [{ status: "pending", note: "Order placed. Payment received via Razorpay.", date: new Date() }],
  });

  res.status(201).json({ order });
});