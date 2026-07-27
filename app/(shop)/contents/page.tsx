"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Filter, Grid3X3, List, ArrowUpDown, Download, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice, fileSizeFormat } from "@/lib/utils";

const contentTypeLabels: Record<string, string> = {
  IMAGE: "Images", VIDEO: "Videos", MOVIE: "Movies", AUDIO: "Audio",
  PDF: "PDFs", COURSE: "Courses", EBOOK: "Ebooks", SOFTWARE: "Software",
  TEMPLATE: "Templates", DOCUMENT: "Documents", EXTERNAL_LINK: "External Links",
  MIXED_FILES: "Mixed Files", WORD: "Word", EXCEL: "Excel", ZIP: "ZIP",
  POWERPOINT: "PowerPoint", TEXT_ARTICLE: "Articles",
};

function ContentCard({ content }: { content: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Link href={`/content/${content.slug}`}>
        <Card className="overflow-hidden card-hover h-full">
          <div className="relative aspect-[16/9] bg-zinc-100 overflow-hidden">
            {content.thumbnail ? (
              <img
                src={content.thumbnail}
                alt={content.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Download className="h-10 w-10 text-zinc-300" />
              </div>
            )}
            {/* Overlay badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {content.priceType === "FREE" && (
                <Badge variant="free" className="text-xs">FREE</Badge>
              )}
              {content.priceType === "PAID" && (
                <Badge variant="paid" className="text-xs">
                  ₹{content.discountPrice || content.originalPrice}
                </Badge>
              )}
            </div>
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="text-xs">
                {content.contentType}
              </Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold line-clamp-1 group-hover:text-purple-600:text-purple-400 transition-colors">
              {content.title}
            </h3>
            {content.subtitle && (
              <p className="text-sm text-zinc-500 line-clamp-1 mt-1">
                {content.subtitle}
              </p>
            )}
            <div className="flex items-center justify-between mt-3 text-xs text-zinc-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {content.views}
                </span>
                <span className="flex items-center gap-1">
                  <Download className="h-3 w-3" /> {content.downloads || 0}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {content.rating || "—"}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function ContentsPageWrapper() {
  return (
    <Suspense fallback={<ContentsPageLoading />}>
      <ContentsPageContent />
    </Suspense>
  );
}

function ContentsPageLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-full max-w-md" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-[16/9] rounded-none" />
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ContentsPageContent() {
  const searchParams = useSearchParams();
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "ALL");
  const [sort, setSort] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchContents();
  }, [typeFilter, sort]);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter && typeFilter !== "ALL") params.set("type", typeFilter);
      if (sort) params.set("sort", sort);
      params.set("limit", "50");

      const res = await fetch(`/api/contents?${params}`);
      const json = await res.json();
      if (json.success) setContents(json.data);
    } catch (error) {
      console.error("Failed to fetch contents", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = contents.filter((c) =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          {typeFilter !== "ALL" ? (
            <span className="flex items-center gap-3">
              {contentTypeLabels[typeFilter] || typeFilter}
              <Badge variant="secondary" className="text-sm font-normal">{filtered.length} items</Badge>
            </span>
          ) : (
            "Browse Content"
          )}
        </h1>
        <p className="text-zinc-500 mt-2">
          {typeFilter !== "ALL"
            ? `Browse all ${(contentTypeLabels[typeFilter] || typeFilter).toLowerCase()} available in our marketplace`
            : "Discover premium digital content curated for you"}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <div className="relative w-full sm:flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px] sm:w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {Object.entries(contentTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[130px] sm:w-[140px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="price_asc">Price: Low</SelectItem>
              <SelectItem value="price_desc">Price: High</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center border border-zinc-200 rounded-lg shrink-0">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-r-none"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-l-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-[16/9] rounded-none" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Download className="mx-auto h-16 w-16 text-zinc-300" />
          <h3 className="text-lg font-semibold mt-4">No content found</h3>
          <p className="text-zinc-500 mt-2">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className={viewMode === "grid"
          ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "space-y-4"
        }>
          {filtered.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      )}
    </div>
  );
}
