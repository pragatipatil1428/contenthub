"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";

export default function AdminReportsPage() {
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

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-zinc-500 mt-1">Revenue and activity overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-zinc-500">Total Revenue</p>
            <p className="text-3xl font-bold mt-1">{formatPrice(stats?.totalRevenue || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-zinc-500">Total Purchases</p>
            <p className="text-3xl font-bold mt-1">{stats?.totalPurchases || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-zinc-500">Today's Revenue</p>
            <p className="text-3xl font-bold mt-1">{formatPrice(stats?.todayRevenue || 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Content by Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Content by Type</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm min-w-[250px]">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="text-left py-2 font-medium text-zinc-500">Type</th>
                <th className="text-right py-2 font-medium text-zinc-500">Items</th>
              </tr>
            </thead>
            <tbody>
              {charts?.contentByType?.map((item: any) => (
                <tr key={item.contentType} className="border-b border-zinc-100 last:border-0">
                  <td className="py-2.5 capitalize">{item.contentType.toLowerCase()}</td>
                  <td className="text-right py-2.5 text-zinc-500">{item._count.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Monthly Revenue Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Revenue</CardTitle>
        </CardHeader>          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm min-w-[300px]">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left py-2 font-medium text-zinc-500">Month</th>
                  <th className="text-right py-2 font-medium text-zinc-500">Revenue</th>
                  <th className="text-right py-2 font-medium text-zinc-500">Purchases</th>
                </tr>
              </thead>
              <tbody>
                {charts?.revenue?.slice().reverse().map((item: any) => (
                  <tr key={item.month} className="border-b border-zinc-100 last:border-0">
                    <td className="py-2.5">{item.month}</td>
                    <td className="text-right py-2.5 font-medium whitespace-nowrap">{formatPrice(item.revenue)}</td>
                    <td className="text-right py-2.5 text-zinc-500">{item.purchases}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
      </Card>

      {/* Download Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-zinc-500">Total Users</p>
            <p className="text-2xl font-bold mt-1">{stats?.totalUsers || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-zinc-500">Total Content</p>
            <p className="text-2xl font-bold mt-1">{stats?.totalContent || 0}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
