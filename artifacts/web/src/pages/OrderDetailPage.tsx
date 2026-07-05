import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Package, CheckCircle2 } from "lucide-react";
import { orderApi } from "@/api/services";
import type { Order, OrderStatus } from "@/types";

const STEPS: OrderStatus[] = ["pending", "processing", "shipped", "out_for_delivery", "delivered"];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    orderApi
      .getById(id)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-10">Loading order...</div>;
  if (!order) return <div className="mx-auto max-w-4xl px-4 py-10">Order not found.</div>;

  const currentStepIndex = STEPS.indexOf(order.status);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/orders" className="mb-4 inline-block text-sm text-orange-600 hover:underline">
        &larr; Back to orders
      </Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-neutral-900">Order #{order.trackingNumber}</h1>
        <span className="text-sm text-neutral-500">
          Placed {new Date(order.createdAt).toLocaleDateString()}
        </span>
      </div>

      {order.status !== "cancelled" && (
        <div className="mb-8 rounded-lg border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-neutral-900">Delivery tracking</h2>
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => (
              <div key={step} className="flex flex-1 flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    i <= currentStepIndex ? "bg-orange-500 text-white" : "bg-neutral-200 text-neutral-500"
                  }`}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <span className="mt-1 text-center text-xs capitalize text-neutral-600">
                  {step.replace(/_/g, " ")}
                </span>
                {i < STEPS.length - 1 && (
                  <div
                    className={`absolute h-0.5 ${i < currentStepIndex ? "bg-orange-500" : "bg-neutral-200"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <h2 className="mb-3 font-semibold text-neutral-900">Items</h2>
          <ul className="space-y-3">
            {order.items.map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-neutral-100">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-5 w-5 text-neutral-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">{item.name}</p>
                  <p className="text-xs text-neutral-500">Qty {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-neutral-200 pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Subtotal</span>
              <span>${order.itemsPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Shipping</span>
              <span>{order.shippingPrice === 0 ? "Free" : `$${order.shippingPrice.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-semibold text-neutral-900">
              <span>Total</span>
              <span>${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-neutral-900">Shipping address</h2>
            <p className="text-sm text-neutral-700">
              <span className="font-medium">{order.shippingAddress.fullName}</span>
              <br />
              {order.shippingAddress.phone}
              <br />
              {order.shippingAddress.street}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
            </p>
            <p className="mt-3 text-sm text-neutral-500">Payment: {order.paymentMethod.replace(/_/g, " ")}</p>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-neutral-900">Status history</h2>
            <ul className="space-y-2 text-sm">
              {order.trackingHistory.map((event, i) => (
                <li key={i} className="flex justify-between">
                  <span className="capitalize text-neutral-700">{event.status.replace(/_/g, " ")}</span>
                  <span className="text-neutral-400">{new Date(event.date).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
