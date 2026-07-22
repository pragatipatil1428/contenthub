"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, DollarSign, ShoppingCart, Download, TrendingUp, Activity, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDateTime } from "@/lib/utils";

interface DashboardStats {
  totalUsers: number;
  totalRevenue: number;
  todayRevenue: number;
  totalPurchases: number;
  pendingPurchases: number;
  failedPurchases: number;
  totalContent: number;
  freeDownloads: number;
  paidDownloads: number;
}

interface ChartData {
  revenue: { month: string; revenue: number; purchases: number }[];
  categories: { name: string; count: number }[];
  recentPurchases: any[];
}

const statCards = [
  { key: "totalRevenue", label: "Total Revenue", icon: DollarSign, color: "from-emerald-500 to-teal-500", prefix: "" },
  { key: "todayRevenue", label: "Today's Revenue", icon: TrendingUp, color: "from-blue-500 to-cyan-500", prefix: "" },
  { key: "totalPurchases", label: "Total Purchases", icon: ShoppingCart, color: "from-violet-500 to-purple-500" },
  { key: "totalUsers", label: "Total Users", icon: Users, color: "from-amber-500 to-orange-500" },
  { key: "totalContent", label: "Total Content", icon: Download, color: "from-rose-500 to-pink-500" },
  { key: "pendingPurchases", label: "Pending", icon: Clock, color: "from-yellow-500 to-amber-500" },
  { key: "paidDownloads", label: "Paid Downloads", icon: Activity, color: "from-indigo-500 to-violet-500" },
  { key: "freeDownloads", label: "Free Downloads", icon: Download, color: "from-sky-500 to-blue-500" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/stats").then((r) => r.json()),
      fetch("/api/dashboard/charts").then((r) => r.json()),
    ]).then(([statsRes, chartsRes]) => {
      if (statsRes.success) setStats(statsRes.data);
      if (chartsRes.success) setCharts(chartsRes.data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Welcome back! Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {statCards.map((stat) => {
          const value = stats ? (stats as any)[stat.key] : 0;
          const Icon = stat.icon;
          return (
            <Card key={stat.key} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                    {loading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      <p className="text-2xl font-bold">
                        {stat.prefix || ""}
                        {stat.key.includes("Revenue") || stat.key === "totalRevenue"
                          ? formatPrice(Number(value))
                          : Number(value).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className={`rounded-2xl bg-gradient-to-br ${stat.color} p-3 text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Charts & Recent Data */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {charts?.revenue.slice(-6).map((item) => {
                  const maxRevenue = Math.max(...charts.revenue.map((r) => r.revenue));
                  const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={item.month} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">{item.month}</span>
                        <span className="font-medium">₹{item.revenue.toLocaleString()}</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Purchases */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {charts?.recentPurchases?.slice(0, 5).map((purchase: any) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <ShoppingCart className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{purchase.user?.name || "Unknown"}</p>
                        <p className="text-xs text-zinc-500">
                          {purchase.items?.[0]?.content?.title || "Content"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">₹{purchase.finalAmount}</p>
                      <p className="text-xs text-zinc-500">{formatDateTime(purchase.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {charts?.categories?.map((cat) => {
                  const maxCount = Math.max(...charts.categories.map((c) => c.count));
                  const percentage = maxCount > 0 ? (cat.count / maxCount) * 100 : 0;
                  return (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{cat.name}</span>
                        <span className="text-zinc-500">{cat.count} items</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => window.location.href = "/admin/contents"}>
                <Download className="h-5 w-5" />
                <span className="text-xs">Manage Content</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => window.location.href = "/admin/payments"}>
                <DollarSign className="h-5 w-5" />
                <span className="text-xs">Pending Payments</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => window.location.href = "/admin/users"}>
                <Users className="h-5 w-5" />
                <span className="text-xs">Manage Users</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => window.location.href = "/admin/reports"}>
                <Activity className="h-5 w-5" />
                <span className="text-xs">View Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
