"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store";

export default function BuyerDashboard() {
  const { user } = useAuthStore();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/purchases?limit=5")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setPurchases(json.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Purchases", value: purchases.length, icon: ShoppingBag, href: "/dashboard/purchases", color: "from-blue-500 to-cyan-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-purple-600 to-blue-600 text-white border-0">
          <CardContent className="p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Welcome back, {user?.name?.split(" ")[0] || "User"}!
            </h1>
            <p className="text-purple-100 mt-2 max-w-md">
              Your digital content library is ready. Browse your purchases, downloads, and more.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-6">
              <Link href="/contents">
                <Button variant="secondary" className="bg-white text-purple-600 hover:bg-purple-50">
                  Browse Content <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/purchases">
                <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border border-white/30">
                  My Purchases
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-4"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`rounded-2xl bg-gradient-to-br ${stat.color} p-3 text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </motion.div>

      {/* Recent Purchases */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Purchases</CardTitle>
            <Link href="/dashboard/purchases">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : purchases.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="mx-auto h-12 w-12 text-zinc-300 mb-3" />
                <p className="text-zinc-500">No purchases yet</p>
                <Link href="/contents">
                  <Button variant="outline" size="sm" className="mt-4">
                    Browse Content
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {purchases.map((purchase: any) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-zinc-100 overflow-hidden">
                        {purchase.items?.[0]?.content?.thumbnail ? (
                          <img
                            src={purchase.items[0].content.thumbnail}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-zinc-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {purchase.items?.[0]?.content?.title || "Content"}
                        </p>
                        <p className="text-xs text-zinc-500">{formatDate(purchase.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">₹{purchase.finalAmount}</span>
                      <Badge
                        variant={
                          purchase.paymentStatus === "APPROVED"
                            ? "success"
                            : purchase.paymentStatus === "PENDING"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {purchase.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
