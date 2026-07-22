import Link from "next/link";
import { XCircle, RefreshCw, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function FailedPage() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="max-w-md w-full text-center border-0 shadow-xl">
        <CardContent className="p-8 space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Payment Failed</h1>
            <p className="text-zinc-500">
              Something went wrong with your payment. Please try again or contact support.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/dashboard/purchases">
              <Button className="w-full gap-2">
                <RefreshCw className="h-4 w-4" /> Try Again
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="w-full gap-2">
                <LifeBuoy className="h-4 w-4" /> Contact Support
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
