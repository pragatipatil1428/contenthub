"use client";

import { useState } from "react";
import { File, FileText, FileArchive, Image, Music, Film, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fileSizeFormat } from "@/lib/utils";

interface MediaFile {
  id: string;
  filename: string;
  url: string;
  size: number | null;
  mimeType: string | null;
  type: string | null;
}

interface MediaViewerProps {
  contentType: string;
  title: string;
  thumbnail?: string | null;
  previewVideo?: string | null;
  files: MediaFile[];
  description?: string | null;
}

function getFileIcon(mimeType?: string | null) {
  if (!mimeType) return <File className="h-5 w-5" />;
  if (mimeType.startsWith("audio")) return <Music className="h-5 w-5 text-purple-500" />;
  if (mimeType.startsWith("video")) return <Film className="h-5 w-5 text-blue-500" />;
  if (mimeType.startsWith("image")) return <Image className="h-5 w-5 text-emerald-500" />;
  if (mimeType.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
  if (mimeType.includes("zip") || mimeType.includes("rar")) return <FileArchive className="h-5 w-5 text-amber-500" />;
  return <File className="h-5 w-5 text-zinc-500" />;
}

function getMainMediaFile(files: MediaFile[]): MediaFile | undefined {
  // Cover media is shown via thumbnail/previewVideo props — never treat it
  // as the main file, otherwise a cover video shows in the cover-image space.
  const contentFiles = files.filter((f) => f.type !== "cover");
  return contentFiles.find((f) => f.type === "main" || f.type === "preview") || contentFiles[0];
}

export function MediaViewer({ contentType, title, thumbnail, previewVideo, files, description }: MediaViewerProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const mainFile = getMainMediaFile(files);

  // Cover media (type "cover") is rendered via the thumbnail/previewVideo props
  // above — exclude those files so they don't duplicate in the gallery/video sections.
  const contentFiles = files.filter((f) => f.type !== "cover");
  const imageFiles = contentFiles.filter((f) => f.mimeType?.startsWith("image") && f.url !== thumbnail);
  const videoFiles = contentFiles.filter((f) => f.mimeType?.startsWith("video"));
  const otherFiles = contentFiles.filter((f) => !f.mimeType?.startsWith("image") && !f.mimeType?.startsWith("video"));

  const renderCoverMedia = () => {
    // 1. Preview video always takes priority as hero
    if (previewVideo) {
      return (
        <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
          <video
            controls
            className="h-full w-full"
            poster={thumbnail || undefined}
          >
            <source src={previewVideo} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    // 2. Show thumbnail as hero cover image
    if (thumbnail) {
      return (
        <div className="rounded-2xl overflow-hidden bg-zinc-100 shadow-lg">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-auto max-h-[60vh] object-contain mx-auto cursor-pointer transition-opacity hover:opacity-95"
            onClick={() => setLightboxImage(thumbnail)}
          />
        </div>
      );
    }

    // 3. No cover media set — keep the audio player for AUDIO content only.
    //    For everything else, don't show any video/image above the description.
    if (contentType === "AUDIO" && mainFile) {
      return (
        <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 p-6 sm:p-8 space-y-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Music className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-sm text-zinc-500">{mainFile.filename}</p>
            </div>
          </div>
          <audio controls className="w-full">
            <source src={mainFile.url} type={mainFile.mimeType || "audio/mpeg"} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    // 4. No cover media — render nothing above the description
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Cover Media - Always shows thumbnail or previewVideo as hero */}
      {renderCoverMedia()}

      {/* Description */}
      {description && (
        <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-100">
          <p className="text-zinc-600 text-sm leading-relaxed">{description}</p>
        </div>
      )}

      {/* Image Gallery — grid of images from uploaded files */}
      {imageFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-2">
            <Image className="h-4 w-4 text-emerald-500" />
            Gallery ({imageFiles.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {imageFiles.map((file) => (
              <div
                key={file.id}
                className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 hover:border-zinc-400 transition-all"
              >
                <button
                  type="button"
                  onClick={() => setLightboxImage(file.url)}
                  className="w-full h-full"
                >
                  <img
                    src={file.url}
                    alt={file.filename}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </button>
                {/* Hover overlay with actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 group-hover:bg-black/40 transition-all">
                  <button
                    type="button"
                    onClick={() => setLightboxImage(file.url)}
                    className="h-8 w-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-zinc-700 shadow-sm opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
                    title="View full image"
                  >
                    <Image className="h-4 w-4" />
                  </button>
                  <a
                    href={file.url}
                    download={file.filename}
                    className="h-8 w-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-zinc-700 shadow-sm opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
                    title="Download image"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Files */}
      {videoFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-2">
            <Film className="h-4 w-4 text-blue-500" />
            Videos ({videoFiles.length})
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {videoFiles.map((file) => (
              <div key={file.id} className="aspect-video rounded-xl overflow-hidden bg-black">
                <video controls className="h-full w-full">
                  <source src={file.url} type={file.mimeType || "video/mp4"} />
                </video>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Downloadable Files — everything else (PDF, ZIP, etc.) */}
      {otherFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-2">
            <Download className="h-4 w-4 text-purple-500" />
            Downloadable Files ({otherFiles.length})
          </h3>
          <div className="space-y-2">
            {otherFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-300 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getFileIcon(file.mimeType)}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.filename}</p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      {file.type && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 capitalize">{file.type}</Badge>}
                      {file.size && <span>{fileSizeFormat(file.size)}</span>}
                      {file.mimeType && <span className="text-zinc-400">{file.mimeType.split("/")[1]?.toUpperCase()}</span>}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0 gap-1.5 h-8" asChild>
                  <a href={file.url} download={file.filename}>
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No files message */}
      {contentFiles.length === 0 && (
        <div className="text-center py-12 rounded-xl border-2 border-dashed border-zinc-200">
          <Download className="mx-auto h-12 w-12 text-zinc-300" />
          <p className="mt-3 text-sm text-zinc-500">No files available yet</p>
        </div>
      )}

      {/* ═══ Lightbox ═══ */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightboxImage}
            alt="Preview"
            className="max-h-[90vh] max-w-full object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
