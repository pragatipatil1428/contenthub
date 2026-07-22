"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Download, Eye, Star, Share2, Heart, Bookmark,
  Clock, User, Globe, FileText, ChevronRight, ShoppingCart,
  Check, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
          toast.success("Content unlocked! You can now download it.");
          router.push(`/dashboard/purchases`);
        } else {
          // Redirect to payment page
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
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FileText className="h-16 w-16 text-zinc-300" />
        <h2 className="text-xl font-semibold mt-4">Content not found</h2>
        <p className="text-zinc-500 mt-2">The content you're looking for doesn't exist</p>
        <Link href="/contents">
          <Button variant="outline" className="mt-6">Browse Content</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-50">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/contents" className="hover:text-zinc-900 dark:hover:text-zinc-50">Contents</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-zinc-900 dark:text-zinc-50">{content.title}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thumbnail */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            {content.thumbnail ? (
              <img
                src={content.thumbnail}
                alt={content.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <FileText className="h-16 w-16 text-zinc-300 dark:text-zinc-600" />
              </div>
            )}
            {content.previewVideo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer">
                  <svg className="h-6 w-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Title & Meta */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="secondary">{content.contentType}</Badge>
              {content.priceType === "FREE" ? (
                <Badge variant="free">Free</Badge>
              ) : (
                <Badge variant="paid">Premium</Badge>
              )}
              {content.isFeatured && <Badge variant="premium">Featured</Badge>}
              {content.isTrending && <Badge variant="warning">Trending</Badge>}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">{content.title}</h1>
            {content.subtitle && (
              <p className="text-lg text-zinc-500 dark:text-zinc-400 mt-2">{content.subtitle}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-zinc-500">
              {content.author && (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" /> {content.author}
                </span>
              )}
              {content.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {content.duration} min
                </span>
              )}
              {content.language && (
                <span className="flex items-center gap-1">
                  <Globe className="h-4 w-4" /> {content.language}
                </span>
              )}
              {content.fileSize && (
                <span className="flex items-center gap-1">
                  <Download className="h-4 w-4" /> {fileSizeFormat(content.fileSize)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" /> {content.views} views
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />{" "}
                {content.rating ? `${content.rating}/5` : "No ratings"}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({content._count?.reviews || 0})</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="prose dark:prose-invert max-w-none">
              <div className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {content.description || "No description available."}
              </div>
              {content.richText && (
                <div className="mt-4" dangerouslySetInnerHTML={{ __html: content.richText }} />
              )}
            </TabsContent>
            <TabsContent value="details">
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Content Type", content.contentType],
                  ["Release Date", formatDate(content.releaseDate)],
                  ["Version", content.version],
                  ["Language", content.language],
                  ["Author", content.author],
                  ["File Size", fileSizeFormat(content.fileSize)],
                  ["Duration", content.duration ? `${content.duration} min` : "—"],
                  ["Category", content.category?.name || "—"],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-500">{label}</span>
                    <span className="font-medium">{value || "—"}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="reviews">
              {content.reviews?.length > 0 ? (
                <div className="space-y-4">
                  {content.reviews.map((review: any) => (
                    <div key={review.id} className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{review.user?.name}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-300">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-center py-8">No reviews yet</p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Purchase Card */}
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-6">
              {/* Price */}
              <div className="text-center">
                {content.priceType === "FREE" ? (
                  <div className="text-4xl font-bold text-emerald-500">Free</div>
                ) : (
                  <div>
                    <div className="text-3xl font-bold">
                      {formatPrice(content.discountPrice || content.originalPrice)}
                    </div>
                    {content.originalPrice && content.discountPrice && content.originalPrice > content.discountPrice && (
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="text-lg text-zinc-400 line-through">
                          {formatPrice(content.originalPrice)}
                        </span>
                        <Badge variant="destructive" className="text-xs">
                          {Math.round(((content.originalPrice - content.discountPrice) / content.originalPrice) * 100)}% OFF
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full gap-2"
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
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <Heart className="h-4 w-4" /> Wishlist
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" /> Instant download
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" /> Lifetime access
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" /> Secure payment
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
