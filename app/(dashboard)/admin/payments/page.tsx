"use client";

import { useEffect, useState } from "react";
import { Check, X, Search, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/qr");
      const json = await res.json();
      if (json.success) setPayments(json.data);
    } catch {
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: "approve" | "reject") => {
    try {
      const res = await fetch(`/api/payments/qr/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Payment ${action}ed successfully`);
        fetchPayments();
      } else {
        toast.error(json.message);
      }
    } catch {
      toast.error("Failed to process payment");
    }
  };

  const filtered = payments.filter(
    (p) =>
      p.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.transactionId?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = payments.filter((p) => p.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payment Management</h1>
          <p className="text-zinc-500 mt-1">
            Review and manage payment requests
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="warning" className="text-sm px-4 py-1">
            {pendingCount} Pending
          </Badge>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search by name or transaction..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[750px] md:min-w-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Buyer</TableHead>
                  <TableHead className="hidden sm:table-cell">Content</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden md:table-cell">Transaction ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-zinc-500">
                      No payment requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{payment.user?.name}</p>
                          <p className="text-xs text-zinc-500 truncate">{payment.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="truncate block max-w-[150px]">
                          {payment.purchase?.items?.[0]?.content?.title || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">
                        {formatPrice(payment.amount)}
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500 hidden md:table-cell">
                        {payment.transactionId || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === "APPROVED"
                              ? "success"
                              : payment.status === "REJECTED"
                              ? "destructive"
                              : "warning"
                          }
                          className="whitespace-nowrap"
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-500 text-sm hidden sm:table-cell whitespace-nowrap">
                        {formatDateTime(payment.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {payment.purchase?.id && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <Link href={`/success?purchaseId=${payment.purchase.id}`} target="_blank">
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          {payment.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 text-emerald-500"
                                onClick={() => handleAction(payment.id, "approve")}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 text-red-500"
                                onClick={() => handleAction(payment.id, "reject")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
