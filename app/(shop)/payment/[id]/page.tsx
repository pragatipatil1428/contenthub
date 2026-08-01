"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import {
  QrCode, Copy, Clock, Upload, Check,
  Loader2, ArrowLeft, CheckCircle, XCircle,
  LayoutDashboard, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const [purchase, setPurchase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transactionId, setTransactionId] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(1800); // 30 minutes
  const [copied, setCopied] = useState(false);
  const [upiId, setUpiId] = useState("admin@contenthub");
  const [receiverName, setReceiverName] = useState("");
  const [qrImage, setQrImage] = useState("");

  useEffect(() => {
    // Fetch payment settings (UPI ID, receiver name, custom QR image)
    fetch("/api/settings")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          if (json.data?.upi_id) setUpiId(json.data.upi_id);
          if (json.data?.qr_receiver) setReceiverName(json.data.qr_receiver);
          if (json.data?.qr_image) setQrImage(json.data.qr_image);
        }
      })
      .catch(console.error);
  }, []);

  const isApprovedStatus = (status?: string) =>
    status === "APPROVED" || status === "SUCCESS";
  const isRejectedStatus = (status?: string) =>
    status === "REJECTED" || status === "FAILED" || status === "REFUNDED";

  // Fetch purchase details and redirect to success page if already approved
  useEffect(() => {
    fetch(`/api/purchases/${params.id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setPurchase(json.data);
          if (isApprovedStatus(json.data.paymentStatus)) {
            router.replace(`/success?purchaseId=${json.data.id}`);
          } else if (isRejectedStatus(json.data.paymentStatus)) {
            // Show the rejection screen instead of the payment form
            setSubmitted(true);
          } else if (json.data.qrPayment && json.data.paymentStatus === "PENDING") {
            // Already submitted and awaiting approval — show pending screen
            // (starts the poll, which redirects to /success once approved)
            setSubmitted(true);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  // While payment is pending approval, poll for status changes and
  // redirect to the success page the moment the admin approves.
  useEffect(() => {
    if (!submitted) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/purchases/${params.id}`);
        const json = await res.json();
        if (json.success && json.data) {
          setPurchase(json.data);
          if (isApprovedStatus(json.data.paymentStatus)) {
            router.replace(`/success?purchaseId=${json.data.id}`);
          } else if (isRejectedStatus(json.data.paymentStatus)) {
            clearInterval(timer); // terminal state — stop polling
          }
        }
      } catch {
        // ignore polling errors — retry on next tick
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [submitted, params.id]);

  // Countdown timer
  useEffect(() => {
    if (!countdown || purchase?.paymentStatus !== "PENDING") return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown, purchase]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Standard UPI deep link — scannable by all UPI apps (GPay, PhonePe, Paytm, etc.)
  const upiDeepLink = purchase
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
        receiverName || ""
      )}&am=${purchase.finalAmount}&cu=INR&tn=${encodeURIComponent(
        `Order ${purchase.orderNumber}`
      )}`
    : "";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitPayment = async () => {
    if (!transactionId.trim()) {
      toast.error("Please enter transaction ID");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/payments/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaseId: params.id,
          transactionId: transactionId.trim(),
          paymentNote: paymentNote.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
        toast.success("Payment submitted! Pending admin approval.");
      } else {
        toast.error(json.message);
      }
    } catch {
      toast.error("Failed to submit payment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">Purchase not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/")}>
          Go Home
        </Button>
      </div>
    );
  }

  // Submitted state — show confirmation on this page
  if (submitted) {
    const isRejected = isRejectedStatus(purchase?.paymentStatus);
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg px-4 py-12"
      >
        <Card className="border-0 shadow-xl overflow-hidden">
          <div
            className={`h-2 ${isRejected
              ? "bg-gradient-to-r from-red-400 to-rose-500"
              : "bg-gradient-to-r from-emerald-400 to-teal-500"}`}
          />
          <CardContent className="p-8 sm:p-10 text-center space-y-6">
            <div
              className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ring-8 ${isRejected
                ? "bg-red-50 ring-red-50/50"
                : "bg-emerald-50 ring-emerald-50/50"}`}
            >
              {isRejected ? (
                <XCircle className="h-10 w-10 text-red-500" />
              ) : (
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">
                {isRejected ? "Payment Not Approved" : "Payment Submitted!"}
              </h1>
              <p className="text-zinc-500 text-sm">
                {isRejected ? (
                  <>
                    We couldn&apos;t verify your payment for{" "}
                    <strong>{purchase.items?.[0]?.content?.title}</strong>.
                    Please contact support or try again.
                  </>
                ) : (
                  <>
                    Your payment for{" "}
                    <strong>{purchase.items?.[0]?.content?.title}</strong> has been received.
                    An admin will review and approve it shortly.
                  </>
                )}
              </p>
            </div>

            <div
              className={`rounded-xl border p-4 text-left space-y-2 ${isRejected
                ? "bg-red-50 border-red-200"
                : "bg-amber-50 border-amber-200"}`}
            >
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Order Number</span>
                <span className="font-medium">{purchase.orderNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Amount</span>
                <span className="font-bold">{formatPrice(purchase.finalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Status</span>
                <Badge
                  variant={isRejected ? "destructive" : "warning"}
                  className="text-xs"
                >
                  {isRejected ? "Rejected" : "Pending Approval"}
                </Badge>
              </div>
              {(transactionId || purchase.qrPayment?.transactionId) && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Transaction ID</span>
                  <span className="font-mono text-xs">
                    {transactionId || purchase.qrPayment?.transactionId}
                  </span>
                </div>
              )}
              {isRejected && purchase.qrPayment?.adminNote && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Admin Note</span>
                  <span className="font-medium text-zinc-700 max-w-[60%] text-right">
                    {purchase.qrPayment.adminNote}
                  </span>
                </div>
              )}
            </div>

            {!isRejected && (
              <div className="flex items-center justify-center gap-2 text-xs text-amber-600">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Typically reviewed within 24 hours
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <Link href="/dashboard/purchases">
                <Button className="w-full gap-2">
                  <LayoutDashboard className="h-4 w-4" /> View My Purchases
                </Button>
              </Link>
              <Link href="/contents">
                <Button variant="outline" className="w-full gap-2">
                  Continue Shopping <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl px-4 py-8"
    >
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="space-y-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-zinc-500">Order Number</span>
              <span className="font-medium">{purchase.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Content</span>
              <span className="font-medium">{purchase.items?.[0]?.content?.title || "Content"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Amount</span>
              <span className="text-xl font-bold">{formatPrice(purchase.finalAmount)}</span>
            </div>
            <div className="border-t border-zinc-200 pt-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-amber-600">
                  Complete payment within {formatTime(countdown)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Payment */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Pay via UPI / QR</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Code */}
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-2xl bg-white p-4 border border-zinc-200 shadow-sm">
                {qrImage ? (
                  <img
                    src={qrImage}
                    alt="UPI QR code"
                    className="h-52 w-52 object-contain"
                  />
                ) : upiId ? (
                  <div aria-label="UPI QR code">
                    <QRCode value={upiDeepLink} size={200} />
                  </div>
                ) : (
                  <div className="flex h-52 w-52 items-center justify-center text-center text-sm text-zinc-400">
                    Payment details not configured yet. Please contact the seller.
                  </div>
                )}
              </div>
              <p className="text-xs text-zinc-500">
                Scan this QR with any UPI app (Google Pay, PhonePe, Paytm)
              </p>
            </div>

            {/* Amount */}
            <div className="text-center">
              <p className="text-sm text-zinc-500">Amount to Pay</p>
              <p className="text-3xl font-bold">{formatPrice(purchase.finalAmount)}</p>
              {receiverName && (
                <p className="text-sm text-zinc-500 mt-1">
                  Paying <span className="font-medium text-zinc-700">{receiverName}</span>
                </p>
              )}
            </div>

            {/* UPI ID (fallback) */}
            <div className="space-y-2">
              <Label>UPI ID</Label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Input value={upiId} readOnly className="bg-zinc-50 flex-1" />
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1"
                  onClick={() => handleCopy(upiId)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 sm:p-4">
              <ol className="text-sm text-amber-800 space-y-1.5 list-decimal list-inside">
                <li>Open any UPI app and scan the QR code</li>
                <li>Pay the exact amount shown above</li>
                <li>Enter the transaction ID below to confirm</li>
              </ol>
            </div>

            {/* Transaction Form */}
            <div className="space-y-4 border-t border-zinc-200 pt-4">
              <h3 className="font-semibold">Confirm Your Payment</h3>
              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID *</Label>
                <Input
                  id="transactionId"
                  placeholder="Enter UPI transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentNote">Note (optional)</Label>
                <Textarea
                  id="paymentNote"
                  placeholder="Any additional information..."
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                />
              </div>
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleSubmitPayment}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Submit Payment Proof
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
