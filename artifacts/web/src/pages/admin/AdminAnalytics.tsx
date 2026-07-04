import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { adminApi } from "@/api/services";

export default function AdminAnalytics() {
  const [sales, setSales] = useState<{ date: string; revenue: number; orders: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; unitsSold: number }[]>([]);
  const [breakdown, setBreakdown] = useState<{ status: string; count: number }[]>([]);

  useEffect(() => {
    adminApi.sales(30).then(setSales);
    adminApi.topProducts().then(setTopProducts);
    adminApi.orderStatusBreakdown().then(setBreakdown);
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Analytics</h1>

      <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-neutral-900">Revenue (last 30 days)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={sales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-neutral-900">Top products</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="unitsSold" fill="#1c1917" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-neutral-900">Orders by status</h2>
          <ul className="space-y-3">
            {breakdown.map((b) => (
              <li key={b.status} className="flex items-center justify-between text-sm">
                <span className="capitalize text-neutral-600">{b.status.replace(/_/g, " ")}</span>
                <span className="font-semibold text-neutral-900">{b.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
