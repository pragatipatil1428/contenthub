"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle, Download, ArrowRight, LayoutDashboard,
  Loader2, Clock, FileText, ShoppingBag, Music, Film
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaViewer } from "@/components/ui/media-viewer";
import { formatPrice, formatDate } from "@/lib/utils";

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const purchaseId = searchParams.get("purchaseId");

  const [purchase, setPurchase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!purchaseId) {
      setError(true);
      setLoading(false);
      return;
    }

    fetch("/api/purchases")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const found = json.data.find((p: any) => p.id === purchaseId);
          if (found) {
            setPurchase(found);
          } else {
            setError(true);
          }
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [purchaseId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 space-y-8">
        <div className="text-center">
          <Skeleton className="h-20 w-20 rounded-full mx-auto" />
          <Skeleton className="h-8 w-64 mx-auto mt-4" />
          <Skeleton className="h-4 w-48 mx-auto mt-2" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="aspect-video w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-md w-full text-center border-0 shadow-xl">
          <CardContent className="p-8 space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <FileText className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold">Purchase Not Found</h1>
            <p className="text-zinc-500">
              We couldn&apos;t find this purchase. It may have been removed or the link is invalid.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/dashboard/purchases">
                <Button className="w-full gap-2">
                  <ShoppingBag className="h-4 w-4" /> View My Purchases
                </Button>
              </Link>
              <Link href="/contents">
                <Button variant="outline" className="w-full gap-2">
                  Browse Content <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const content = purchase.items?.[0]?.content;
  const isApproved = purchase.paymentStatus === "APPROVED";
  const isPending = purchase.paymentStatus === "PENDING";
  const isPaid = purchase.finalAmount > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8"
    >
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">
            {isApproved ? "Purchase Successful!" : "Payment Submitted!"}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-md mx-auto">
            {isApproved
              ? "Your content is ready. View and download it below."
              : "Your payment is pending admin approval. You'll be notified once confirmed."}
          </p>
        </div>
      </motion.div>

      {/* Order Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                  {content?.title?.charAt(0) || "C"}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{content?.title || "Content"}</h2>
                  <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDate(purchase.createdAt)}
                    </span>
                    <span>Order #{purchase.orderNumber}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isPaid && (
                  <div className="text-right">
                    <p className="text-sm text-zinc-500">Amount Paid</p>
                    <p className="text-2xl font-bold">{formatPrice(purchase.finalAmount)}</p>
                  </div>
                )}
                <Badge
                  variant={isApproved ? "success" : "warning"}
                  className="text-sm px-3 py-1"
                >
                  {isApproved ? "Approved" : isPending ? "Pending" : purchase.paymentStatus}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content Media Viewer */}
      {isApproved && content && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {content.contentType === "AUDIO" ? (
                    <Music className="h-5 w-5 text-purple-500" />
                  ) : content.contentType === "VIDEO" || content.contentType === "MOVIE" ? (
                    <Film className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Download className="h-5 w-5 text-emerald-500" />
                  )}
                  Your Content
                </CardTitle>
                <Badge variant="secondary">{content.contentType}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <MediaViewer
                contentType={content.contentType}
                title={content.title}
                thumbnail={content.thumbnail}
                files={content.files || []}
                description={content.description}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Pending state */}
      {!isApproved && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-6 text-center space-y-3">
              <Clock className="mx-auto h-12 w-12 text-amber-500" />
              <h3 className="font-semibold text-lg">Awaiting Approval</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                Your payment has been submitted and is pending admin review.
                You&apos;ll receive a notification once it&apos;s approved.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3 pb-8"
      >
        {isApproved && (
          <Link href="/dashboard/purchases">
            <Button size="lg" className="gap-2">
              <LayoutDashboard className="h-4 w-4" /> Go to My Purchases
            </Button>
          </Link>
        )}
        <Link href="/dashboard">
          <Button variant="outline" size="lg" className="gap-2">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Button>
        </Link>
        <Link href="/contents">
          <Button variant="ghost" size="lg" className="gap-2">
            Continue Shopping <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-3xl px-4 py-12 space-y-8">
        <div className="text-center">
          <Skeleton className="h-20 w-20 rounded-full mx-auto" />
          <Skeleton className="h-8 w-64 mx-auto mt-4" />
          <Skeleton className="h-4 w-48 mx-auto mt-2" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="aspect-video w-full rounded-2xl" />
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
