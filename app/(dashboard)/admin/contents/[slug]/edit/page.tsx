"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  ArrowLeft, Loader2, Plus, X, Save, Image,
  FileText, Tag, DollarSign, Check, Trash2, Eye,
  Upload, Download, File, Music, Film, FileArchive
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { contentSchema, type ContentInput } from "@/lib/validations";
import { slugify, fileSizeFormat } from "@/lib/utils";
import { toast } from "sonner";

const contentTypeLabels: Record<string, string> = {
  IMAGE: "Image", VIDEO: "Video", MOVIE: "Movie", AUDIO: "Audio",
  PDF: "PDF", COURSE: "Course", EBOOK: "Ebook", SOFTWARE: "Software",
  TEMPLATE: "Template", DOCUMENT: "Document", EXTERNAL_LINK: "External Link",
  MIXED_FILES: "Mixed Files", WORD: "Word", EXCEL: "Excel", ZIP: "ZIP",
  POWERPOINT: "PowerPoint", TEXT_ARTICLE: "Article",
};

const statusVariants = [
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
  { value: "HIDDEN", label: "Hidden" },
];

const priceTypeOptions = [
  { value: "FREE", label: "Free" },
  { value: "PAID", label: "Paid" },
  { value: "COMING_SOON", label: "Coming Soon" },
  { value: "HIDDEN", label: "Hidden" },
];

export default function EditContentPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [autoSlug, setAutoSlug] = useState(false);
  const [customSlug, setCustomSlug] = useState(slug);
  const [originalSlug, setOriginalSlug] = useState(slug);
  const [isDeleting, setIsDeleting] = useState(false);

  // File management
  const [contentFiles, setContentFiles] = useState<any[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState("main");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
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
      const generated = slugify(watchTitle);
      setCustomSlug(generated);
    }
  }, [watchTitle, autoSlug]);

  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [previewVideoUrl, setPreviewVideoUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileSize, setFileSize] = useState<number | null>(null);

  // Fetch content files
  const fetchContentFiles = async () => {
    try {
      const res = await fetch(`/api/contents/${slug}/files`);
      const json = await res.json();
      if (json.success) setContentFiles(json.data);
    } catch {
      console.error("Failed to fetch files");
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", selectedFileType);

      const res = await fetch(`/api/contents/${slug}/files`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        toast.success(`"${file.name}" uploaded`);
        fetchContentFiles();
      } else {
        toast.error(json.message || "Upload failed");
      }
    } catch {
      toast.error("Failed to upload file");
    } finally {
      setUploadingFile(false);
      e.target.value = "";
    }
  };

  // Handle file delete
  const handleFileDelete = async (fileId: string, filename: string) => {
    if (!confirm(`Delete "${filename}"?`)) return;
    try {
      const res = await fetch(`/api/contents/${slug}/files?id=${fileId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("File deleted");
        fetchContentFiles();
      } else {
        toast.error(json.message || "Delete failed");
      }
    } catch {
      toast.error("Failed to delete file");
    }
  };

  // Content type -> accepted file formats mapping
  const contentTypeAcceptMap: Record<string, { accept: string; hint: string }> = {
    AUDIO: { accept: ".mp3,.wav,.flac,.aac,.ogg,.wma,.m4a,.opus", hint: "MP3, WAV, FLAC, AAC, OGG" },
    VIDEO: { accept: ".mp4,.avi,.mov,.mkv,.wmv,.webm,.flv", hint: "MP4, AVI, MOV, MKV, WEBM" },
    MOVIE: { accept: ".mp4,.mkv,.avi,.webm", hint: "MP4, MKV, AVI, WEBM" },
    IMAGE: { accept: ".jpg,.jpeg,.png,.webp,.gif,.svg,.bmp,.tiff", hint: "JPG, PNG, WEBP, GIF, SVG" },
    PDF: { accept: ".pdf", hint: "PDF" },
    EBOOK: { accept: ".pdf,.epub,.mobi,.azw3", hint: "PDF, EPUB, MOBI" },
    DOCUMENT: { accept: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt", hint: "PDF, DOC, XLS, PPT, TXT" },
    WORD: { accept: ".doc,.docx", hint: "DOC, DOCX" },
    EXCEL: { accept: ".xls,.xlsx,.csv", hint: "XLS, XLSX, CSV" },
    POWERPOINT: { accept: ".ppt,.pptx", hint: "PPT, PPTX" },
    ZIP: { accept: ".zip,.rar,.7z,.tar,.gz", hint: "ZIP, RAR, 7Z, TAR" },
    SOFTWARE: { accept: ".exe,.msi,.dmg,.apk,.deb,.rpm", hint: "EXE, MSI, DMG, APK" },
    TEMPLATE: { accept: ".zip,.rar,.tar.gz", hint: "ZIP, RAR (template files)" },
    COURSE: { accept: ".mp4,.pdf,.zip,.mp3", hint: "MP4, PDF, ZIP, MP3" },
    MIXED_FILES: { accept: "", hint: "Any file type" },
    EXTERNAL_LINK: { accept: "", hint: "External links don't need file uploads" },
    TEXT_ARTICLE: { accept: ".txt,.md,.html,.pdf", hint: "TXT, MD, HTML, PDF" },
  };

  const currentFileConfig = contentTypeAcceptMap[watchContentType] || { accept: "", hint: "Any file type" };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <File className="h-5 w-5" />;
    if (mimeType.startsWith("audio")) return <Music className="h-5 w-5 text-purple-500" />;
    if (mimeType.startsWith("video")) return <Film className="h-5 w-5 text-blue-500" />;
    if (mimeType.startsWith("image")) return <Image className="h-5 w-5 text-emerald-500" />;
    if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar")) return <FileArchive className="h-5 w-5 text-amber-500" />;
    return <File className="h-5 w-5 text-zinc-500" />;
  };

  // Fetch categories
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCategories(json.data);
      })
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  // Fetch existing content
  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    fetch(`/api/contents/${slug}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          const c = json.data;
          setOriginalSlug(c.slug);
          setCustomSlug(c.slug);

          // Populate form fields
          reset({
            title: c.title || "",
            subtitle: c.subtitle || "",
            description: c.description || "",
            richText: c.richText || "",
            contentType: c.contentType || "IMAGE",
            status: c.status || "DRAFT",
            priceType: c.priceType || "FREE",
            originalPrice: c.originalPrice ?? undefined,
            discountPrice: c.discountPrice ?? undefined,
            currency: c.currency || "INR",
            categoryId: c.categoryId || "",
            subCategoryId: c.subCategoryId || "",
            language: c.language || "",
            author: c.author || "",
            duration: c.duration ?? undefined,
            releaseDate: c.releaseDate ? new Date(c.releaseDate).toISOString().split("T")[0] : "",
            version: c.version || "",
            isFeatured: c.isFeatured || false,
            isTrending: c.isTrending || false,
            isPopular: c.isPopular || false,
            isNewArrival: c.isNewArrival || false,
            isRecommended: c.isRecommended || false,
          });

          // Set tags
          if (c.tags?.length > 0) {
            setTags(c.tags.map((t: any) => t.name));
          }

          // Set file fields
          setThumbnailUrl(c.thumbnail || "");
          setPreviewImageUrl(c.previewImage || "");
          setPreviewVideoUrl(c.previewVideo || "");
          setFileUrl(c.fileUrl || "");
          setFileSize(c.fileSize ?? null);
        } else {
          toast.error("Content not found");
          router.push("/admin/contents");
        }
      })
      .catch(() => {
        toast.error("Failed to load content");
        router.push("/admin/contents");
      })
      .finally(() => {
        setIsLoading(false);
        fetchContentFiles();
      });
  }, [slug, reset, router]);

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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this content? This action cannot be undone.")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/contents/${originalSlug}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Content deleted");
        router.push("/admin/contents");
      } else {
        toast.error(json.message || "Failed to delete");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const onSubmit = async (data: ContentInput) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        slug: customSlug || slugify(data.title),
        thumbnail: thumbnailUrl || null,
        previewImage: previewImageUrl || null,
        previewVideo: previewVideoUrl || null,
        fileUrl: fileUrl || null,
        fileSize: fileSize || null,
        tags,
        originalPrice: data.priceType === "PAID" ? data.originalPrice : null,
        discountPrice: data.priceType === "PAID" ? data.discountPrice : null,
        categoryId: data.categoryId || null,
        subCategoryId: data.subCategoryId || null,
        duration: data.duration || null,
        releaseDate: data.releaseDate || null,
      };

      const res = await fetch(`/api/contents/${originalSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        toast.success("Content updated successfully!");
        router.push("/admin/contents");
      } else {
        toast.error(json.message || "Failed to update content");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === watch("categoryId"));

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <div>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold">Edit Content</h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                Update your digital content
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900 dark:hover:bg-red-950"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Delete</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link href={`/content/${originalSlug}`} target="_blank">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </Link>
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
            {isSubmitting ? "Saving..." : "Update Content"}
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
              Edit the core details about your content
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
                      ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400"
                      : "text-zinc-500 bg-zinc-100 dark:bg-zinc-800"
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
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                  URL: /content/{customSlug || "your-slug"}
                </p>
                {customSlug !== originalSlug && (
                  <Badge variant="warning" className="text-xs">
                    URL will change
                  </Badge>
                )}
              </div>
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
              Update categorization and tags
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
                        className="ml-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 p-0.5"
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
              Update the price and availability
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
                  className="flex items-start gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  <input
                    type="checkbox"
                    {...register(flag.key as any)}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <p className="text-sm font-medium">{flag.label}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{flag.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Files & Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="h-5 w-5 text-purple-500" />
              Files & Media
            </CardTitle>
            <CardDescription>
              Upload files and set media URLs for this content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Media URL Fields */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Media URLs</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Thumbnail URL</Label>
                  <Input
                    placeholder="https://example.com/thumb.jpg"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preview Image URL</Label>
                  <Input
                    placeholder="https://example.com/preview.jpg"
                    value={previewImageUrl}
                    onChange={(e) => setPreviewImageUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preview Video URL</Label>
                  <Input
                    placeholder="https://example.com/preview.mp4"
                    value={previewVideoUrl}
                    onChange={(e) => setPreviewVideoUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Main File URL</Label>
                  <Input
                    placeholder="https://example.com/file.pdf"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-800" />

            {/* File Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Uploaded Files ({contentFiles.length})
                </h4>
                <div className="flex items-center gap-2">
                  <Select value={selectedFileType} onValueChange={setSelectedFileType}>
                    <SelectTrigger className="h-9 w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">Main File</SelectItem>
                      <SelectItem value="preview">Preview</SelectItem>
                      <SelectItem value="thumbnail">Thumbnail</SelectItem>
                      <SelectItem value="sample">Sample</SelectItem>
                    </SelectContent>
                  </Select>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept={currentFileConfig.accept}
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      disabled={uploadingFile}
                      asChild
                    >
                      <span>
                        {uploadingFile ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        {uploadingFile ? "Uploading..." : "Upload File"}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>

              {/* Accepted formats hint */}
              {currentFileConfig.hint && (
                <p className="text-xs text-zinc-400">
                  Accepted formats: <span className="font-medium text-zinc-500">{currentFileConfig.hint}</span>
                  {" "}· Max 50MB per file
                </p>
              )}

              {/* File List */}
              {contentFiles.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center">
                  {watchContentType === "AUDIO" ? (
                    <Music className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                  ) : watchContentType === "VIDEO" || watchContentType === "MOVIE" ? (
                    <Film className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                  ) : (
                    <Upload className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                  )}
                  <p className="mt-2 text-sm text-zinc-500">No files uploaded yet</p>
                  <p className="text-xs text-zinc-400">
                    Upload {watchContentType === "AUDIO" ? "audio" : watchContentType === "VIDEO" || watchContentType === "MOVIE" ? "video" : "content"} files ({currentFileConfig.hint.toLowerCase()})
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {contentFiles.map((f: any) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {getFileIcon(f.mimeType)}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{f.filename}</p>
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <span className="capitalize">{f.type}</span>
                            {f.size && <span>{fileSizeFormat(f.size)}</span>}
                            <a
                              href={f.url}
                              target="_blank"
                              className="text-purple-600 hover:text-purple-500 dark:text-purple-400"
                            >
                              <Download className="h-3 w-3 inline" /> View
                            </a>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-zinc-400 hover:text-red-500"
                        onClick={() => handleFileDelete(f.id, f.filename)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
            {isSubmitting ? "Saving..." : "Update Content"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
