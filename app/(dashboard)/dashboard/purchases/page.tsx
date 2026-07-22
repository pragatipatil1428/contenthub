"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Download, FileText, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatPrice } from "@/lib/utils";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/purchases")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setPurchases(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Purchases</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          View all your purchased content
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : purchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <ShoppingBag className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600 mb-3" />
                    <p className="text-zinc-500">No purchases yet</p>
                    <Link href="/contents">
                      <Button variant="outline" size="sm" className="mt-4">
                        Browse Content
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ) : (
                purchases.map((purchase: any) => (
                  <TableRow key={purchase.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center">
                          {purchase.items?.[0]?.content?.thumbnail ? (
                            <img
                              src={purchase.items[0].content.thumbnail}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <FileText className="h-5 w-5 text-zinc-400" />
                          )}
                        </div>
                        <span className="font-medium">
                          {purchase.items?.[0]?.content?.title || "Unknown"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-500">
                      {formatDate(purchase.createdAt)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(purchase.finalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          purchase.paymentStatus === "APPROVED"
                            ? "success"
                            : purchase.paymentStatus === "PENDING"
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {purchase.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-500 text-sm">
                      {purchase.paymentMethod}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {purchase.paymentStatus === "APPROVED" && (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <Link href={`/content/${purchase.items?.[0]?.content?.slug}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {purchase.invoice && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={`/dashboard/invoices/${purchase.invoice.id}`}>
                              <FileText className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
