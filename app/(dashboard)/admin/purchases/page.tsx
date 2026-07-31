"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, ShoppingCart, Eye, Check, X, Clock, XCircle } from "lucide-react";
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const statusFilter = searchParams.get("status") || "all";
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(statusFilter);

  const setFilterParam = (value: string) => {
    setFilter(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };
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

  const handleAction = async (qrPaymentId: string, action: "approve" | "reject") => {
    try {
      const res = await fetch(`/api/payments/qr/${qrPaymentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Payment ${action === "approve" ? "approved" : "rejected"} successfully`);
        fetchPurchases();
      } else {
        toast.error(json.message);
      }
    } catch {
      toast.error("Failed to process payment");
    }
  };

  const filtered = purchases.filter((p) => {
    const matchesSearch =
      p.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      p.items?.[0]?.content?.title?.toLowerCase().includes(search.toLowerCase());
    if (filter === "pending") return matchesSearch && p.paymentStatus === "PENDING";
    if (filter === "approved") return matchesSearch && p.paymentStatus === "APPROVED";
    if (filter === "rejected") return matchesSearch && p.paymentStatus === "REJECTED";
    if (filter === "refunded") return matchesSearch && p.paymentStatus === "REFUNDED";
    if (filter === "failed") return matchesSearch && p.paymentStatus === "FAILED";
    return matchesSearch;
  });

  const qrPendingCount = purchases.filter((p) => p.qrPayment?.status === "PENDING").length;
  const pendingCount = purchases.filter((p) => p.paymentStatus === "PENDING").length;
  const approvedCount = purchases.filter((p) => p.paymentStatus === "APPROVED").length;
  const rejectedCount = purchases.filter((p) => p.paymentStatus === "REJECTED").length;
  const refundedCount = purchases.filter((p) => p.paymentStatus === "REFUNDED").length;
  const failedCount = purchases.filter((p) => p.paymentStatus === "FAILED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Purchases &amp; Payments</h1>
          <p className="text-zinc-500 mt-1">
            View all purchases, approve or reject payments
          </p>
        </div>
        <div className="flex items-center gap-2">
          {qrPendingCount > 0 && (
            <Badge variant="warning" className="text-sm px-4 py-1">
              {qrPendingCount} Need Approval
            </Badge>
          )}
          <Badge variant="secondary" className="text-sm px-4 py-1">
            {purchases.length} Total
          </Badge>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search by user, order, or content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterParam("all")}
                className="text-xs"
              >
                All ({purchases.length})
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterParam("pending")}
                className="text-xs gap-1.5"
              >
                <Clock className="h-3 w-3" />
                Pending ({pendingCount})
              </Button>
              <Button
                variant={filter === "approved" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterParam("approved")}
                className="text-xs gap-1.5"
              >
                <Check className="h-3 w-3" />
                Approved ({approvedCount})
              </Button>
              <Button
                variant={filter === "rejected" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterParam("rejected")}
                className="text-xs gap-1.5"
              >
                <X className="h-3 w-3" />
                Rejected ({rejectedCount})
              </Button>
              <Button
                variant={filter === "refunded" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterParam("refunded")}
                className="text-xs gap-1.5"
              >
                <XCircle className="h-3 w-3" />
                Refunded ({refundedCount})
              </Button>
              <Button
                variant={filter === "failed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterParam("failed")}
                className="text-xs gap-1.5"
              >
                <XCircle className="h-3 w-3" />
                Failed ({failedCount})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[850px] md:min-w-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead className="hidden sm:table-cell">Content</TableHead>
                  <TableHead className="hidden md:table-cell">Order #</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Payment</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-zinc-500">
                      <ShoppingCart className="mx-auto h-12 w-12 text-zinc-300 mb-3" />
                      No purchases found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((purchase, idx) => {
                    const content = purchase.items?.[0]?.content;
                    const isApproved = purchase.paymentStatus === "APPROVED";
                    const qrPending = purchase.qrPayment?.status === "PENDING";

                    return (
                      <TableRow key={purchase.id}>
                        <TableCell className="text-xs text-zinc-400 text-center">{idx + 1}</TableCell>
                        <TableCell>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{purchase.user?.name || "Unknown"}</p>
                            <p className="text-xs text-zinc-500 truncate">{purchase.user?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm hidden sm:table-cell">
                          <span className="truncate block max-w-[150px]">{content?.title || "N/A"}</span>
                        </TableCell>
                        <TableCell className="text-xs text-zinc-500 font-mono hidden md:table-cell">
                          {purchase.orderNumber}
                        </TableCell>
                        <TableCell className="font-medium whitespace-nowrap">
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
                            className="text-xs whitespace-nowrap"
                          >
                            {isApproved ? "Done" : purchase.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-zinc-500 hidden sm:table-cell">
                          {purchase.finalAmount === 0 ? "Free" : purchase.paymentMethod}
                          {qrPending && (
                            <span className="ml-1 text-amber-600 font-medium">(QR)</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-zinc-500 whitespace-nowrap hidden md:table-cell">
                          {formatDateTime(purchase.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {isApproved && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <Link href={`/success?purchaseId=${purchase.id}`} target="_blank">
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            {qrPending && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                                  onClick={() => handleAction(purchase.qrPayment.id, "approve")}
                                  title="Approve payment"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => handleAction(purchase.qrPayment.id, "reject")}
                                  title="Reject payment"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
