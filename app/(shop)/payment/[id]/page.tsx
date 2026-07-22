"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CreditCard, QrCode, Copy, Clock, Upload, Check,
  Loader2, ArrowLeft, ExternalLink
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
  const [countdown, setCountdown] = useState(1800); // 30 minutes
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fetch purchase details
    fetch(`/api/purchases`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const found = json.data.find((p: any) => p.id === params.id);
          setPurchase(found);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

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
        toast.success("Payment submitted! Pending admin approval.");
        router.push(`/success?purchaseId=${params.id}`);
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
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-amber-600 dark:text-amber-400">
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
            {/* QR Code (placeholder) */}
            <div className="flex justify-center">
              <div className="h-48 w-48 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-600">
                <div className="text-center">
                  <QrCode className="mx-auto h-12 w-12 text-zinc-400" />
                  <p className="text-xs text-zinc-400 mt-2">QR Code Here</p>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="text-center">
              <p className="text-sm text-zinc-500">Amount to Pay</p>
              <p className="text-3xl font-bold">{formatPrice(purchase.finalAmount)}</p>
            </div>

            {/* UPI ID */}
            <div className="space-y-2">
              <Label>UPI ID</Label>
              <div className="flex items-center gap-2">
                <Input value="admin@contenthub" readOnly className="bg-zinc-50 dark:bg-zinc-900" />
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1"
                  onClick={() => handleCopy("admin@contenthub")}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                1. Open any UPI app (Google Pay, PhonePe, Paytm)
                2. Scan the QR code or enter the UPI ID
                3. Pay the exact amount shown above
                4. Enter the transaction ID below
              </p>
            </div>

            {/* Transaction Form */}
            <div className="space-y-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
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
