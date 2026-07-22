"use client";

import { File, FileText, FileArchive, Image, Music, Film, Download, ExternalLink } from "lucide-react";
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
  return files.find((f) => f.type === "main" || f.type === "preview") || files[0];
}

export function MediaViewer({ contentType, title, thumbnail, files, description }: MediaViewerProps) {
  const mainFile = getMainMediaFile(files);

  const renderMediaPlayer = () => {
    if (!mainFile) {
      return (
        <div className="aspect-video rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="h-full w-full object-cover rounded-2xl"
            />
          ) : (
            <div className="text-center">
              <FileText className="mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-600" />
              <p className="mt-2 text-sm text-zinc-400">No preview available</p>
            </div>
          )}
        </div>
      );
    }

    const fileUrl = mainFile.url;

    switch (contentType) {
      case "IMAGE":
        return (
          <div className="rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <img
              src={fileUrl}
              alt={title}
              className="w-full h-auto max-h-[70vh] object-contain mx-auto"
            />
          </div>
        );

      case "VIDEO":
      case "MOVIE":
        return (
          <div className="aspect-video rounded-2xl overflow-hidden bg-black">
            <video
              controls
              className="h-full w-full"
              poster={thumbnail || undefined}
            >
              <source src={fileUrl} type={mainFile.mimeType || "video/mp4"} />
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case "AUDIO":
        return (
          <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-100 dark:border-purple-900 p-6 space-y-4">
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
              <source src={fileUrl} type={mainFile.mimeType || "audio/mpeg"} />
              Your browser does not support the audio tag.
            </audio>
          </div>
        );

      case "PDF":
        return (
          <div className="space-y-4">
            <div className="aspect-video rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              <iframe
                src={fileUrl}
                className="h-full w-full"
                title={title}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-900 p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-red-500" />
                <div>
                  <p className="font-medium text-sm">{mainFile.filename}</p>
                  {mainFile.size && (
                    <p className="text-xs text-zinc-500">{fileSizeFormat(mainFile.size)}</p>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a href={fileUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" /> Open
                </a>
              </Button>
            </div>
          </div>
        );

      default:
        // For other content types (EBOOK, SOFTWARE, TEMPLATE, etc.)
        return (
          <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center min-h-[200px]">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={title}
                className="h-full w-full object-cover rounded-2xl max-h-[50vh]"
              />
            ) : (
              <div className="text-center p-8">
                <FileArchive className="mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-600" />
                <p className="mt-2 text-sm text-zinc-400">Content ready for download</p>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Media Player */}
      {renderMediaPlayer()}

      {/* Description */}
      {description && (
        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
          {description}
        </p>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Files ({files.length})
          </h3>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
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
      {files.length === 0 && contentType !== "EXTERNAL_LINK" && (
        <div className="text-center py-8 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
          <Download className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-600" />
          <p className="mt-2 text-sm text-zinc-500">No files available yet</p>
        </div>
      )}
    </div>
  );
}
