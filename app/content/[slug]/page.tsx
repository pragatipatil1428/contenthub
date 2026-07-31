"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Download, Eye, Globe, ChevronRight,
  ShoppingCart, Check, Loader2, FileText, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate, fileSizeFormat } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { toast } from "sonner";

export default function ContentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [playingPreview, setPlayingPreview] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetch(`/api/contents/${params.slug}`)
        .then((r) => r.json())
        .then((json) => {
          if (json.success) setContent(json.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [params.slug]);

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/content/${params.slug}`);
      return;
    }

    setPurchasing(true);
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId: content.id }),
      });
      const json = await res.json();

      if (json.success) {
        if (content.priceType === "FREE") {
          toast.success("Content unlocked!");
          router.push(`/success?purchaseId=${json.data.id}`);
        } else {
          router.push(`/payment/${json.data.id}`);
        }
      } else {
        toast.error(json.message || "Purchase failed");
      }
    } catch {
      toast.error("Failed to process purchase");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50">
        <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-52 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-50">
        <div className="text-center px-4">
          <FileText className="mx-auto h-14 w-14 text-zinc-300" />
          <h2 className="text-lg font-semibold mt-4">Content not found</h2>
          <p className="text-sm text-zinc-500 mt-1">The content you're looking for doesn't exist</p>
          <Link href="/contents">
            <Button variant="outline" className="mt-5">
              Browse Content
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50">
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8"
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Cover Media */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-100 shadow-md">
              {playingPreview && content.previewVideo ? (
                <div className="absolute inset-0 bg-black">
                  <video
                    autoPlay
                    controls
                    className="h-full w-full"
                    poster={content.thumbnail || undefined}
                    onEnded={() => setPlayingPreview(false)}
                  >
                    <source src={content.previewVideo} />
                  </video>
                  <button
                    type="button"
                    className="absolute top-3 right-3 h-7 w-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors z-10"
                    onClick={() => setPlayingPreview(false)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : content.thumbnail ? (
                <img
                  src={content.thumbnail}
                  alt={content.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <FileText className="h-14 w-14 text-zinc-300" />
                </div>
              )}
              {content.previewVideo && !playingPreview && (
                <button
                  type="button"
                  onClick={() => setPlayingPreview(true)}
                  className="absolute inset-0 flex items-center justify-center group cursor-pointer"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 hover:scale-105 transition-all shadow-lg">
                    <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[11px] px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    Play trailer
                  </span>
                </button>
              )}
            </div>

            {/* Title & Meta */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-[11px]">{content.contentType}</Badge>
                {content.priceType === "FREE" ? (
                  <Badge variant="free" className="text-[11px]">Free</Badge>
                ) : (
                  <Badge variant="paid" className="text-[11px]">Premium</Badge>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold">{content.title}</h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-zinc-500">
                {content.language && (
                  <span className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5" /> {content.language}
                  </span>
                )}
                {content.fileSize && (
                  <span className="flex items-center gap-1">
                    <Download className="h-3.5 w-3.5" /> {fileSizeFormat(content.fileSize)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" /> {content.views} views
                </span>
              </div>
            </div>

            {/* Description */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <h3 className="text-sm font-semibold mb-2.5">Description</h3>
                <div className="text-sm text-zinc-600 leading-relaxed">
                  {content.description || "No description available."}
                </div>
                {content.richText && (
                  <div className="mt-3 text-sm" dangerouslySetInnerHTML={{ __html: content.richText }} />
                )}
              </CardContent>
            </Card>

            {/* Compact Details */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <h3 className="text-sm font-semibold mb-3">Details</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {[
                    ["Content Type", content.contentType],
                    ["Language", content.language || "—"],
                    ["Uploaded", content.createdAt ? formatDate(content.createdAt) : "—"],
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex justify-between py-1.5 border-b border-zinc-100">
                      <span className="text-zinc-500 text-xs">{label}</span>
                      <span className="font-medium text-xs">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            {/* Purchase Card */}
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500" />
              <CardContent className="p-4 sm:p-5 space-y-4">
                {/* Price */}
                <div className="text-center">
                  {content.priceType === "FREE" ? (
                    <div className="text-3xl font-bold text-emerald-500">Free</div>
                  ) : (
                    <div>
                      <div className="text-2xl font-bold">
                        {formatPrice(content.discountPrice || content.originalPrice)}
                      </div>
                      {content.originalPrice && content.discountPrice && content.originalPrice > content.discountPrice && (
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <span className="text-sm text-zinc-400 line-through">
                            {formatPrice(content.originalPrice)}
                          </span>
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            {Math.round(((content.originalPrice - content.discountPrice) / content.originalPrice) * 100)}% OFF
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <Button
                  size="default"
                  className="w-full gap-2 h-11"
                  onClick={handlePurchase}
                  disabled={purchasing}
                >
                  {purchasing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : content.priceType === "FREE" ? (
                    <>
                      <Download className="h-4 w-4" /> Download Free
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" /> Purchase Now
                    </>
                  )}
                </Button>

                {/* Info */}
                <div className="space-y-1.5 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-500" /> Instant download
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-500" /> Lifetime access
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-500" /> Secure payment
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Back link */}
            <Link
              href="/contents"
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 transition-colors justify-center"
            >
              <ChevronRight className="h-3 w-3 rotate-180" />
              Back to browse
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
