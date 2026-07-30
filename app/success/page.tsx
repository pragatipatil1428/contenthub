"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle, Download, ArrowRight, LayoutDashboard,
  Clock, FileText, ShoppingBag, Music, Film,
  Calendar, Hash, CreditCard, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaViewer } from "@/components/ui/media-viewer";
import { formatPrice, formatDate, formatDateTime } from "@/lib/utils";

// ─── Animation variants ───────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

// ─── Loading Skeleton ─────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-5 lg:px-6 space-y-6">
        <div className="text-center space-y-4">
          <Skeleton className="h-24 w-24 rounded-full mx-auto" />
          <Skeleton className="h-10 w-72 mx-auto" />
          <Skeleton className="h-5 w-56 mx-auto" />
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <div className="flex justify-center gap-4">
          <Skeleton className="h-12 w-44 rounded-xl" />
          <Skeleton className="h-12 w-44 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────
function ErrorState() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 bg-gradient-to-br from-zinc-50 via-white to-zinc-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-2 bg-gradient-to-r from-red-500 to-rose-500" />
          <CardContent className="p-8 sm:p-10 space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/50">
              <FileText className="h-10 w-10 text-red-500" />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Purchase Not Found</h1>
              <p className="text-zinc-500 leading-relaxed">
                We couldn&apos;t find this purchase. It may have been removed or the link is invalid.
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Link href="/dashboard/purchases">
                <Button className="w-full gap-2 h-11">
                  <ShoppingBag className="h-4 w-4" /> View My Purchases
                </Button>
              </Link>
              <Link href="/contents">
                <Button variant="outline" className="w-full gap-2 h-11">
                  Browse Content <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ─── Content Type Icon ────────────────────────────────────────────────
function ContentTypeIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case "AUDIO": return <Music className={className} />;
    case "VIDEO": return <Film className={className} />;
    default: return <Download className={className} />;
  }
}

// ─── Detail Row ───────────────────────────────────────────────────────
function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-zinc-100 last:border-0">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 shrink-0">
        <Icon className="h-4 w-4 text-zinc-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-zinc-400">{label}</p>
        <p className="text-sm font-medium text-zinc-800 truncate">{value}</p>
      </div>
    </div>
  );
}

// ─── Confetti-like Floating Particles ────────────────────────────────
function SuccessParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full"
          style={{
            background: ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EC4899"][i % 5],
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1.2, 1, 0],
            y: [0, -30 + Math.random() * -60],
            x: [0, (Math.random() - 0.5) * 40],
          }}
          transition={{
            duration: 2 + Math.random() * 1.5,
            delay: 0.3 + Math.random() * 0.5,
            repeat: Infinity,
            repeatDelay: 3 + Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────
function SuccessPageContent() {
  const searchParams = useSearchParams();
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

    fetch(`/api/purchases/${purchaseId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setPurchase(json.data);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [purchaseId]);

  if (loading) return <LoadingSkeleton />;
  if (error || !purchase) return <ErrorState />;

  const content = purchase.items?.[0]?.content;
  const isApproved = purchase.paymentStatus === "APPROVED";
  const isPending = purchase.paymentStatus === "PENDING";
  const isPaid = purchase.finalAmount > 0;

  // prettify payment method for display
  const paymentLabel = isPaid
    ? (purchase.paymentMethod || "QR_CODE")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase())
    : "Free";

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative mx-auto max-w-2xl px-4 py-10 sm:px-5 lg:px-6 space-y-6"
      >
        {/* ═══ SUCCESS HEADER ═══ */}
        <motion.div
          variants={itemVariants}
          className="relative text-center space-y-5 pt-6 sm:pt-10"
        >
          {/* Animated check */}
          <div className="relative inline-flex">
            <motion.div
              variants={scaleIn}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-200/50"
            >
              <motion.div
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              >
                <CheckCircle className="h-8 w-8 text-white" />
              </motion.div>
            </motion.div>
            {isApproved && <SuccessParticles />}
          </div>

          <div className="space-y-2">
            <motion.h1
              variants={itemVariants}
              className="text-2xl sm:text-3xl font-bold tracking-tight"
            >
              {isApproved ? (
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  Purchase Successful!
                </span>
              ) : (
                "Payment Submitted!"
              )}
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-zinc-500 max-w-md mx-auto text-sm leading-relaxed"
            >
              {isApproved
                ? "Your content is ready. View and download it below."
                : "Your payment is pending admin approval. You'll be notified once confirmed."}
            </motion.p>
          </div>
        </motion.div>

        {/* ═══ ORDER RECEIPT CARD ═══ */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-xl shadow-zinc-200/50 overflow-hidden">
            {/* Top gradient accent */}
            <div className="h-2 bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500" />
            <CardContent className="p-4 sm:p-6">
              {/* Buyer & Order info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-purple-200/50 shrink-0">
                    {content?.title?.charAt(0)?.toUpperCase() || "C"}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold truncate">                  {content?.title || "Content"}</h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDateTime(purchase.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {purchase.orderNumber}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isPaid && (
                    <div className="text-right">
                      <p className="text-xs text-zinc-400">Amount Paid</p>
                      <p className="text-xl font-bold text-zinc-900">
                        {formatPrice(purchase.finalAmount)}
                      </p>
                    </div>
                  )}
                  <Badge
                    variant={isApproved ? "success" : "warning"}
                    className="text-sm px-4 py-1.5 rounded-full"
                  >
                    {isApproved ? "Completed" : isPending ? "Pending" : purchase.paymentStatus}
                  </Badge>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-zinc-100" />

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 pt-4">
                <DetailRow icon={Package} label="Content Type" value={content?.contentType || "—"} />
                <DetailRow icon={CreditCard} label="Payment Method" value={paymentLabel} />
                <DetailRow icon={Calendar} label="Purchase Date" value={formatDateTime(purchase.createdAt)} />
                <DetailRow icon={Hash} label="Order Number" value={purchase.orderNumber} />
                {purchase.user?.name && (
                  <DetailRow icon={ShoppingBag} label="Purchased By" value={purchase.user.name} />
                )}
                {purchase.user?.email && (
                  <DetailRow icon={FileText} label="Email" value={purchase.user.email} />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ CONTENT PREVIEW ═══ */}
        {isApproved && content ? (
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-xl shadow-zinc-200/50 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-zinc-50 to-white border-b border-zinc-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                      <ContentTypeIcon type={content.contentType} className="h-4 w-4" />
                    </div>
                    <span>Your Content</span>
                  </CardTitle>
                  <Badge variant="secondary" className="rounded-full px-3">
                    {content.contentType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <MediaViewer
                  contentType={content.contentType}
                  title={content.title}
                  thumbnail={content.thumbnail}
                  previewVideo={content.previewVideo}
                  files={content.files || []}
                  description={content.description}
                />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* ═══ PENDING STATE ═══ */
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-xl shadow-amber-200/20 overflow-hidden bg-gradient-to-br from-amber-50 to-yellow-50/30">
              <CardContent className="p-8 sm:p-10 text-center space-y-5">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100"
                >
                  <Clock className="h-8 w-8 text-amber-600" />
                </motion.div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-amber-900">Awaiting Approval</h3>
                  <p className="text-amber-700/80 max-w-md mx-auto text-sm leading-relaxed">
                    Your payment has been submitted and is pending admin review.
                    We&apos;ll send you a notification once it&apos;s confirmed.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-amber-600">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  Typically reviewed within 24 hours
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ═══ TRANSACTION DETAILS (for paid purchases) ═══ */}
        {isPaid && purchase.qrPayment && (
          <motion.div variants={itemVariants}>
            <Card className="border border-zinc-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-zinc-500" />
                  Transaction Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {purchase.qrPayment.transactionId && (
                  <div className="flex justify-between py-2 border-b border-zinc-100">
                    <span className="text-zinc-500">Transaction ID</span>
                    <span className="font-mono font-medium text-zinc-800">{purchase.qrPayment.transactionId}</span>
                  </div>
                )}
                {purchase.qrPayment.approvedAt && (
                  <div className="flex justify-between py-2 border-b border-zinc-100">
                    <span className="text-zinc-500">Approved At</span>
                    <span className="font-medium">{formatDate(purchase.qrPayment.approvedAt)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span className="text-zinc-500">Amount</span>
                  <span className="font-bold">{formatPrice(purchase.finalAmount)}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ═══ ACTION BUTTONS ═══ */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-2 pb-6"
        >
          {isApproved && (
            <Link href="/dashboard/purchases">
              <Button
                size="default"
                className="gap-2 h-10 px-5 rounded-xl shadow-md shadow-purple-200/30 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm"
              >
                <LayoutDashboard className="h-3.5 w-3.5" /> My Purchases
              </Button>
            </Link>
          )}
          <Link href="/dashboard">
            <Button variant="outline" size="default" className="gap-2 h-10 px-5 rounded-xl border-zinc-300 text-sm">
              <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
            </Button>
          </Link>
          <Link href="/contents">
            <Button variant="ghost" size="default" className="gap-2 h-10 px-5 rounded-xl text-sm text-zinc-600">
              Shop <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────
export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <SuccessPageContent />
    </Suspense>
  );
}
