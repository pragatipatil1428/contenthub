"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminPurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/purchases");
      const json = await res.json();
      if (json.success) setPurchases(json.data);
    } catch {
      toast.error("Failed to fetch purchases");
    } finally {
      setLoading(false);
    }
  };

  const filtered = purchases.filter(
    (p) =>
      p.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      p.items?.[0]?.content?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Purchases</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            View all purchases across all users
          </p>
        </div>
        <Badge variant="secondary" className="text-sm px-4 py-1">
          {purchases.length} Total
        </Badge>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search by user, order, or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Buyer</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Order #</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-zinc-500">
                    <ShoppingCart className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600 mb-3" />
                    No purchases found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((purchase) => {
                  const content = purchase.items?.[0]?.content;
                  const isApproved = purchase.paymentStatus === "APPROVED";

                  return (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{purchase.user?.name || "Unknown"}</p>
                          <p className="text-xs text-zinc-500">{purchase.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {content?.title || "N/A"}
                      </TableCell>
                      <TableCell className="text-xs text-zinc-500 font-mono">
                        {purchase.orderNumber}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(purchase.finalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            isApproved
                              ? "success"
                              : purchase.paymentStatus === "PENDING"
                              ? "warning"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {isApproved ? "Completed" : purchase.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-zinc-500">
                        {purchase.paymentMethod}
                      </TableCell>
                      <TableCell className="text-xs text-zinc-500 whitespace-nowrap">
                        {formatDateTime(purchase.createdAt)}
                      </TableCell>
                      <TableCell>
                        {content?.slug && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={`/content/${content.slug}`} target="_blank">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
