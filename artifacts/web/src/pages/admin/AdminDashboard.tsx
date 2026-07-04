import { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, Users, Package, AlertTriangle, Clock } from "lucide-react";
import { adminApi } from "@/api/services";

interface Summary {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  pendingOrders: number;
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    adminApi.summary().then(setSummary);
  }, []);

  const cards = summary
    ? [
        { label: "Total revenue", value: `$${summary.totalRevenue.toFixed(2)}`, icon: DollarSign },
        { label: "Total orders", value: summary.totalOrders, icon: ShoppingBag },
        { label: "Customers", value: summary.totalCustomers, icon: Users },
        { label: "Products", value: summary.totalProducts, icon: Package },
        { label: "Low stock items", value: summary.lowStockCount, icon: AlertTriangle },
        { label: "Pending orders", value: summary.pendingOrders, icon: Clock },
      ]
    : [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-neutral-200 bg-white p-5">
            <Icon className="mb-2 h-6 w-6 text-orange-500" />
            <p className="text-2xl font-bold text-neutral-900">{value}</p>
            <p className="text-sm text-neutral-500">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
