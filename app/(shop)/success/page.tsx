import Link from "next/link";
import { CheckCircle, Download, ArrowRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SuccessPage() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="max-w-md w-full text-center border-0 shadow-xl">
        <CardContent className="p-8 space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Payment Successful!</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Thank you for your purchase. Your content is now available.
            </p>
          </div>

          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Order Number</span>
              <span className="font-medium">ORD-ABC123-XYZ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Date</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Amount</span>
              <span className="font-medium">₹1,999</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/dashboard/purchases">
              <Button className="w-full gap-2">
                <Download className="h-4 w-4" /> Download Now
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full gap-2">
                <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
              </Button>
            </Link>
            <Link href="/contents">
              <Button variant="ghost" className="w-full gap-2">
                Continue Shopping <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
