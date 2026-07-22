"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  ArrowLeft, Loader2, Plus, X, Save, Image,
  FileText, Tag, DollarSign, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { contentSchema, type ContentInput } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { toast } from "sonner";

const contentTypeLabels: Record<string, string> = {
  IMAGE: "Image", VIDEO: "Video", MOVIE: "Movie", AUDIO: "Audio",
  PDF: "PDF", COURSE: "Course", EBOOK: "Ebook", SOFTWARE: "Software",
  TEMPLATE: "Template", DOCUMENT: "Document", EXTERNAL_LINK: "External Link",
  MIXED_FILES: "Mixed Files", WORD: "Word", EXCEL: "Excel", ZIP: "ZIP",
  POWERPOINT: "PowerPoint", TEXT_ARTICLE: "Article",
};

const statusVariants = [
  { value: "PUBLISHED", label: "Published", color: "success" },
  { value: "DRAFT", label: "Draft", color: "warning" },
  { value: "HIDDEN", label: "Hidden", color: "secondary" },
];

const priceTypeOptions = [
  { value: "FREE", label: "Free" },
  { value: "PAID", label: "Paid" },
  { value: "COMING_SOON", label: "Coming Soon" },
  { value: "HIDDEN", label: "Hidden" },
];

export default function NewContentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [autoSlug, setAutoSlug] = useState(true);
  const [customSlug, setCustomSlug] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContentInput>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      contentType: "IMAGE",
      status: "DRAFT",
      priceType: "FREE",
      currency: "INR",
      isFeatured: false,
      isTrending: false,
      isPopular: false,
      isNewArrival: false,
      isRecommended: false,
    },
  });

  const watchTitle = watch("title");
  const watchPriceType = watch("priceType");
  const watchContentType = watch("contentType");

  // Auto-generate slug from title
  useEffect(() => {
    if (autoSlug && watchTitle) {
      setCustomSlug(slugify(watchTitle));
    }
  }, [watchTitle, autoSlug]);

  // Fetch categories
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCategories(json.data);
      })
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const onSubmit = async (data: ContentInput) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        slug: customSlug || slugify(data.title),
        tags,
        originalPrice: data.priceType === "PAID" ? data.originalPrice : null,
        discountPrice: data.priceType === "PAID" ? data.discountPrice : null,
        categoryId: data.categoryId || null,
        subCategoryId: data.subCategoryId || null,
        duration: data.duration || null,
        releaseDate: data.releaseDate || null,
      };

      const res = await fetch("/api/contents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        toast.success("Content created successfully!");
        router.push("/admin/contents");
      } else {
        toast.error(json.message || "Failed to create content");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === watch("categoryId"));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/contents")}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Create Content</h1>
              <p className="text-zinc-500 mt-1">
                Add new digital content to your marketplace
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/contents")}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSubmitting ? "Saving..." : "Save Content"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-purple-500" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Enter the core details about your content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. Complete Web Development Course"
                {...register("title")}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                placeholder="e.g. Learn Full-Stack Development from Scratch"
                {...register("subtitle")}
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="slug">Slug</Label>
                <button
                  type="button"
                  onClick={() => setAutoSlug(!autoSlug)}
                  className={`text-xs flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                    autoSlug
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-zinc-500 bg-zinc-100"
                  }`}
                >
                  <Check className={`h-3 w-3 ${autoSlug ? "block" : "hidden"}`} />
                  Auto
                </button>
              </div>
              <Input
                id="slug"
                placeholder="content-slug"
                value={customSlug}
                onChange={(e) => {
                  setAutoSlug(false);
                  setCustomSlug(slugify(e.target.value));
                }}
                className="font-mono text-sm"
              />
              <p className="text-xs text-zinc-400">
                URL: /content/{customSlug || "your-slug"}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your content..."
                rows={4}
                {...register("description")}
              />
            </div>

            {/* Author & Language */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  placeholder="Content creator name"
                  {...register("author")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={watch("language") || ""}
                  onValueChange={(v) => setValue("language", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {["English", "Hindi", "Spanish", "French", "German", "Japanese", "Chinese", "Arabic", "Portuguese", "Russian", "Other"].map((lang) => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Duration & Version */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  placeholder="e.g. 60"
                  {...register("duration", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  placeholder="e.g. 1.0.0"
                  {...register("version")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Classification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Tag className="h-5 w-5 text-purple-500" />
              Classification
            </CardTitle>
            <CardDescription>
              Categorize and tag your content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Content Type */}
            <div className="space-y-2">
              <Label htmlFor="contentType">
                Content Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watchContentType}
                onValueChange={(v) => setValue("contentType", v as any)}
              >
                <SelectTrigger className={errors.contentType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(contentTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.contentType && (
                <p className="text-xs text-red-500">{errors.contentType.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch("status") || "DRAFT"}
                onValueChange={(v) => setValue("status", v as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusVariants.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select
                value={watch("categoryId") || ""}
                onValueChange={(v) => setValue("categoryId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sub Category */}
            {selectedCategory && selectedCategory.subCategories?.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="subCategoryId">Sub Category</Label>
                <Select
                  value={watch("subCategoryId") || ""}
                  onValueChange={(v) => setValue("subCategoryId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {selectedCategory.subCategories.map((sub: any) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addTag}
                  disabled={!tagInput.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pl-3">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 rounded-full hover:bg-zinc-200 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-purple-500" />
              Pricing
            </CardTitle>
            <CardDescription>
              Set the price and availability of your content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Price Type */}
            <div className="space-y-2">
              <Label htmlFor="priceType">Price Type</Label>
              <Select
                value={watchPriceType}
                onValueChange={(v) => setValue("priceType", v as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select price type" />
                </SelectTrigger>
                <SelectContent>
                  {priceTypeOptions.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {watchPriceType === "PAID" && (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price (₹)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 4999"
                      {...register("originalPrice", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountPrice">Discounted Price (₹)</Label>
                    <Input
                      id="discountPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 1999"
                      {...register("discountPrice", { valueAsNumber: true })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={watch("currency") || "INR"}
                    onValueChange={(v) => setValue("currency", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Promotional Flags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Image className="h-5 w-5 text-purple-500" />
              Promotion & Visibility
            </CardTitle>
            <CardDescription>
              Control how your content is featured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { key: "isFeatured", label: "Featured", desc: "Show on featured sections" },
                { key: "isTrending", label: "Trending", desc: "Mark as trending content" },
                { key: "isPopular", label: "Popular", desc: "Mark as popular content" },
                { key: "isNewArrival", label: "New Arrival", desc: "Mark as new arrival" },
                { key: "isRecommended", label: "Recommended", desc: "Show as recommended" },
              ].map((flag) => (
                <label
                  key={flag.key}
                  className="flex items-start gap-3 rounded-xl border border-zinc-200 p-4 cursor-pointer hover:bg-zinc-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    {...register(flag.key as any)}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <p className="text-sm font-medium">{flag.label}</p>
                    <p className="text-xs text-zinc-500">{flag.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Form Actions - Mobile */}
        <div className="flex items-center justify-between pb-8 lg:hidden">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/contents")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSubmitting ? "Saving..." : "Save Content"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
