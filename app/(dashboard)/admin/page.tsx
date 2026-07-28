"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ShoppingCart, Download, DollarSign, ArrowRight, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDateTime } from "@/lib/utils";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/stats").then((r) => r.json()),
      fetch("/api/dashboard/charts").then((r) => r.json()),
    ])
      .then(([statsRes, chartsRes]) => {
        if (statsRes.success) setStats(statsRes.data);
        if (chartsRes.success) setCharts(chartsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: "Total Revenue",
      value: stats ? formatPrice(stats.totalRevenue) : "—",
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Total Users",
      value: stats ? String(stats.totalUsers) : "—",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Content",
      value: stats ? String(stats.totalContent) : "—",
      icon: Download,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Total Purchases",
      value: stats ? String(stats.totalPurchases) : "—",
      icon: ShoppingCart,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-zinc-500 mt-1">Overview of your marketplace</p>
        </div>
        {stats?.pendingPurchases > 0 && (
          <Link href="/admin/purchases?status=pending">
            <Button variant="outline" size="sm" className="gap-2 border-amber-200 text-amber-700 hover:bg-amber-50 w-full sm:w-auto">
              <Clock className="h-4 w-4" />
              {stats.pendingPurchases} Pending
            </Button>
          </Link>
        )}
      </div>

      {/* Key Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-7 w-28" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="p-5 flex items-start justify-between">
                    <div>
                      <p className="text-sm text-zinc-500">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`${stat.bg} ${stat.color} rounded-xl p-2.5`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Additional Stats Row */}
      {!loading && stats && (
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm font-normal">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            {stats.totalPurchases} completed
          </Badge>
          <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm font-normal">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            {stats.pendingPurchases} pending
          </Badge>
          <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm font-normal">
            <XCircle className="h-3.5 w-3.5 text-red-500" />
            {stats.failedPurchases} failed
          </Badge>
          <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm font-normal">
            <Download className="h-3.5 w-3.5 text-blue-500" />
            {stats.freeDownloads} free downloads
          </Badge>
        </div>
      )}

      {/* Recent Purchases */}
      <Card>
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="font-semibold">Recent Purchases</h2>
          <Link href="/admin/purchases" className="text-sm text-purple-600 hover:text-purple-500 flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : charts?.recentPurchases?.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-sm">
              No purchases yet
            </div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {charts?.recentPurchases?.slice(0, 6).map((purchase: any) => (
                <div key={purchase.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                      <ShoppingCart className="h-4 w-4 text-zinc-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {purchase.user?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        {purchase.items?.[0]?.content?.title || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-medium">{formatPrice(purchase.finalAmount)}</p>
                    <p className="text-xs text-zinc-400">{formatDateTime(purchase.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Link href="/admin/contents">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-purple-50 text-purple-600 rounded-lg p-2">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Content</p>
                <p className="text-xs text-zinc-500">Manage items</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/users">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-blue-50 text-blue-600 rounded-lg p-2">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Users</p>
                <p className="text-xs text-zinc-500">Manage users</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/purchases">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-amber-50 text-amber-600 rounded-lg p-2">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Purchases</p>
                <p className="text-xs text-zinc-500">Manage purchases</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/reports">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-emerald-50 text-emerald-600 rounded-lg p-2">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Reports</p>
                <p className="text-xs text-zinc-500">View analytics</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
