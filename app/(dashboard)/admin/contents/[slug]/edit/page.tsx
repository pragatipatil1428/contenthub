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
  IMAGE: "Image", VIDEO: "Video", AUDIO: "Audio",
  PDF: "PDF", EBOOK: "Ebook", SOFTWARE: "Software",
  TEMPLATE: "Template", DOCUMENT: "Document", COURSE: "Course",
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
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [autoSlug, setAutoSlug] = useState(false);
  const [customSlug, setCustomSlug] = useState(slug);
  const [originalSlug, setOriginalSlug] = useState(slug);
  const [isDeleting, setIsDeleting] = useState(false);

  // File management
  const [contentFiles, setContentFiles] = useState<any[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [coverVideo, setCoverVideo] = useState("");
  const [coverMediaType, setCoverMediaType] = useState<"image" | "video">("image");
  const [uploadingCoverImage, setUploadingCoverImage] = useState(false);
  const [uploadingCoverVideo, setUploadingCoverVideo] = useState(false);

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

  // Handle cover image upload
  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCoverImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/contents/${slug}/files`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        setCoverImage(json.data.url);
        toast.success("Cover image uploaded");
      } else {
        toast.error(json.message || "Upload failed");
      }
    } catch {
      toast.error("Failed to upload cover image");
    } finally {
      setUploadingCoverImage(false);
      e.target.value = "";
    }
  };

  // Handle cover video upload
  const handleCoverVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCoverVideo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/contents/${slug}/files`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        setCoverVideo(json.data.url);
        toast.success("Cover video uploaded");
      } else {
        toast.error(json.message || "Upload failed");
      }
    } catch {
      toast.error("Failed to upload cover video");
    } finally {
      setUploadingCoverVideo(false);
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
    IMAGE: { accept: ".jpg,.jpeg,.png,.webp,.gif,.svg,.bmp,.tiff", hint: "JPG, PNG, WEBP, GIF, SVG" },
    PDF: { accept: ".pdf", hint: "PDF" },
    EBOOK: { accept: ".pdf,.epub,.mobi", hint: "PDF, EPUB, MOBI" },
    SOFTWARE: { accept: ".zip,.rar,.7z,.exe,.msi,.dmg,.apk", hint: "ZIP, RAR, EXE, DMG, APK" },
    TEMPLATE: { accept: ".zip,.rar,.tar.gz", hint: "ZIP, RAR (template files)" },
    DOCUMENT: { accept: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt", hint: "PDF, DOC, XLS, PPT, TXT" },
    COURSE: { accept: ".mp4,.pdf,.zip,.mp3", hint: "MP4, PDF, ZIP, MP3" },
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
            description: c.description || "",
            richText: c.richText || "",
            contentType: c.contentType || "IMAGE",
            status: c.status || "DRAFT",
            priceType: c.priceType || "FREE",
            originalPrice: c.originalPrice ?? undefined,
            discountPrice: c.discountPrice ?? undefined,
            currency: c.currency || "INR",
            language: c.language || "",
          });

          // Set tags
          if (c.tags?.length > 0) {
            setTags(c.tags.map((t: any) => t.name));
          }

          // Set file fields
          setFileSize(c.fileSize ?? null);
          setCoverImage(c.thumbnail || "");
          setCoverVideo(c.previewVideo || "");
          // Default to video tab if a cover video exists
          if (c.previewVideo) setCoverMediaType("video");
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
        thumbnail: coverImage || null,
        previewVideo: coverVideo || null,
        fileSize: fileSize || null,
        tags,
        originalPrice: data.priceType === "PAID" ? data.originalPrice : null,
        discountPrice: data.priceType === "PAID" ? data.discountPrice : null,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/contents")}
              className="h-9 w-9 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold truncate">Edit Content</h1>
              <p className="text-zinc-500 mt-1 text-sm hidden sm:block">
                Update your digital content
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
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
          <Button variant="outline" size="sm" className="gap-2 hidden sm:inline-flex" asChild>
            <Link href={`/content/${originalSlug}`} target="_blank">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </Link>
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            size="sm"
            className="gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSubmitting ? "Saving..." : "Update"}
          </Button>
        </div>
      </div>

      {/* Mobile description */}
      <p className="text-zinc-500 mt-1 text-sm sm:hidden">
        Update your digital content
      </p>

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

            {/* Language */}
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
          </CardHeader        >
          <CardContent className="space-y-6">
            {/* Cover Media */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-purple-500" />
                <h4 className="text-sm font-medium text-zinc-700">Cover Media</h4>
              </div>
              <p className="text-xs text-zinc-400 -mt-2">
                Shown on browse cards and the content page before purchase
              </p>

              {/* Cover Media Type Toggle */}
              <div className="flex items-center gap-2 p-1 bg-zinc-100 rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => setCoverMediaType("image")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    coverMediaType === "image"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-700"
                  }`}
                >
                  <Image className="h-3.5 w-3.5 inline mr-1.5" />
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => setCoverMediaType("video")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    coverMediaType === "video"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-700"
                  }`}
                >
                  <Film className="h-3.5 w-3.5 inline mr-1.5" />
                  Video
                </button>
              </div>

              {/* Cover Image */}
              {coverMediaType === "image" && (
                <div className="rounded-xl border border-zinc-200 p-4 space-y-3">
                  <Label className="text-sm">Cover Image</Label>
                  {coverImage ? (
                    <div className="relative rounded-lg overflow-hidden bg-zinc-100 max-h-40">
                      <img
                        src={coverImage}
                        alt="Cover"
                        className="w-full h-40 object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 h-7 w-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors"
                        onClick={() => setCoverImage("")}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-zinc-50 border border-dashed border-zinc-200 h-32 flex flex-col items-center justify-center text-zinc-400">
                      <Image className="h-8 w-8 mb-1 opacity-40" />
                      <p className="text-xs">No cover image set</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleCoverImageUpload}
                        disabled={uploadingCoverImage}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingCoverImage}
                        asChild
                      >
                        <span>
                          {uploadingCoverImage ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                          ) : (
                            <Upload className="h-3.5 w-3.5 mr-1" />
                          )}
                          Upload
                        </span>
                      </Button>
                    </label>
                    <Input
                      placeholder="Or paste image URL"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      className="h-8 text-xs flex-1"
                    />
                  </div>
                </div>
              )}

              {/* Cover Video */}
              {coverMediaType === "video" && (
                <div className="rounded-xl border border-zinc-200 p-4 space-y-3">
                  <Label className="text-sm">Cover Video / Trailer</Label>
                  {coverVideo ? (
                    <div className="relative rounded-lg overflow-hidden bg-black max-h-40">
                      <video
                        src={coverVideo}
                        controls
                        className="w-full h-40 object-contain"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 h-7 w-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors"
                        onClick={() => setCoverVideo("")}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-zinc-50 border border-dashed border-zinc-200 h-32 flex flex-col items-center justify-center text-zinc-400">
                      <Film className="h-8 w-8 mb-1 opacity-40" />
                      <p className="text-xs">No cover video set</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept="video/*"
                        onChange={handleCoverVideoUpload}
                        disabled={uploadingCoverVideo}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingCoverVideo}
                        asChild
                      >
                        <span>
                          {uploadingCoverVideo ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                          ) : (
                            <Upload className="h-3.5 w-3.5 mr-1" />
                          )}
                          Upload
                        </span>
                      </Button>
                    </label>
                    <Input
                      placeholder="Or paste video URL"
                      value={coverVideo}
                      onChange={(e) => setCoverVideo(e.target.value)}
                      className="h-8 text-xs flex-1"
                    />
                  </div>
                </div>
              )}

              <div className="border-t border-zinc-100" />
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h4 className="text-sm font-medium text-zinc-700">
                  Uploaded Files ({contentFiles.length})
                </h4>
                <div className="flex items-center gap-2 w-full sm:w-auto">
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
                <div className="rounded-xl border-2 border-dashed border-zinc-200 p-8 text-center">
                  {watchContentType === "AUDIO" ? (
                    <Music className="mx-auto h-8 w-8 text-zinc-300" />
                  ) : watchContentType === "VIDEO" ? (
                    <Film className="mx-auto h-8 w-8 text-zinc-300" />
                  ) : (
                    <Upload className="mx-auto h-8 w-8 text-zinc-300" />
                  )}
                  <p className="mt-2 text-sm text-zinc-500">No files uploaded yet</p>
                  <p className="text-xs text-zinc-400">
                    Upload {watchContentType === "AUDIO" ? "audio" : watchContentType === "VIDEO" ? "video" : "content"} files ({currentFileConfig.hint.toLowerCase()})
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {contentFiles.map((f: any) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3"
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
                              className="text-purple-600 hover:text-purple-500"
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
        <div className="flex items-center justify-between pb-8 sm:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/contents")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            size="sm"
            className="gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSubmitting ? "Saving..." : "Update"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
