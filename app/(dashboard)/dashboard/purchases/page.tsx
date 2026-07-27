"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Download, FileText, ShoppingBag, Music, Film, Image, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatPrice } from "@/lib/utils";

const contentTypeIcons: Record<string, any> = {
  IMAGE: Image,
  VIDEO: Film,
  MOVIE: Film,
  AUDIO: Music,
  PDF: FileText,
  EBOOK: FileText,
  DOCUMENT: FileText,
};

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
        <p className="text-zinc-500 mt-1">
          View all your purchased content
        </p>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[650px] md:min-w-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead className="hidden sm:table-cell">Purchase Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Payment</TableHead>
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
                      <ShoppingBag className="mx-auto h-12 w-12 text-zinc-300 mb-3" />
                      <p className="text-zinc-500">No purchases yet</p>
                      <Link href="/contents">
                        <Button variant="outline" size="sm" className="mt-4">
                          Browse Content
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  purchases.map((purchase: any) => {
                    const content = purchase.items?.[0]?.content;
                    const TypeIcon = contentTypeIcons[content?.contentType] || FileText;
                    const isApproved = purchase.paymentStatus === "APPROVED";

                    return (
                      <TableRow key={purchase.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-zinc-100 overflow-hidden flex items-center justify-center shrink-0">
                              {content?.thumbnail ? (
                                <img
                                  src={content.thumbnail}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <TypeIcon className="h-5 w-5 text-zinc-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-medium block truncate">
                                {content?.title || "Unknown"}
                              </span>
                              <span className="text-xs text-zinc-400 capitalize">
                                {content?.contentType?.toLowerCase() || "—"}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-zinc-500 whitespace-nowrap hidden sm:table-cell">
                          {formatDate(purchase.createdAt)}
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
                            className="whitespace-nowrap"
                          >
                            {isApproved ? "Active" : purchase.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-zinc-500 text-sm hidden md:table-cell">
                          {purchase.finalAmount === 0 ? "Free" : purchase.paymentMethod}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {isApproved && content && (
                              <Link href={`/success?purchaseId=${purchase.id}`}>
                                <Button variant="default" size="sm" className="gap-1.5 h-8 text-xs sm:text-sm">
                                  <Eye className="h-3.5 w-3.5" />
                                  <span className="hidden sm:inline">View</span> Content
                                </Button>
                              </Link>
                            )}
                            {!isApproved && purchase.paymentStatus === "PENDING" && (
                              <Link href={`/payment/${purchase.id}`}>
                                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs sm:text-sm">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  Pay
                                </Button>
                              </Link>
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
