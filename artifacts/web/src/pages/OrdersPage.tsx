import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderApi } from "@/api/services";
import type { Order } from "@/types";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  out_for_delivery: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi
      .myOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-10">Loading orders...</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Order history</h1>
      {orders.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
          <p className="mb-4 text-neutral-500">You haven't placed any orders yet.</p>
          <Link to="/catalog" className="rounded-md bg-neutral-900 px-6 py-2.5 font-semibold text-white">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-4 transition hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-neutral-900">
                  Order #{order.trackingNumber}
                </p>
                <p className="text-sm text-neutral-500">
                  {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item(s)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    statusColors[order.status] ?? "bg-neutral-100 text-neutral-700"
                  }`}
                >
                  {order.status.replace(/_/g, " ")}
                </span>
                <span className="font-semibold text-neutral-900">${order.totalPrice.toFixed(2)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
