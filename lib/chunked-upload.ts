export const MAX_UPLOAD_SIZE = 200 * 1024 * 1024; // 200MB
const CHUNK_SIZE = 3 * 1024 * 1024; // 3MB — safely under Vercel's 4.5MB request limit

export interface ChunkedUploadResult {
  id: string;
  url: string;
}

/**
 * Uploads a file to the server in chunks. Each chunk stays well under
 * Vercel's 4.5MB serverless function request limit, so large videos work
 * without any external storage service. Bytes are stored in the database.
 *
 * @param file       The file to upload
 * @param slug       Content slug to attach the file to
 * @param type       ContentFile type (e.g. "main", "cover")
 * @param onProgress Optional callback with upload percentage (0-100)
 */
export async function uploadFileInChunks(
  file: File,
  slug: string,
  options: { type?: string; onProgress?: (percent: number) => void } = {}
): Promise<ChunkedUploadResult> {
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error(`File too large. Maximum size is ${Math.round(MAX_UPLOAD_SIZE / (1024 * 1024))}MB`);
  }

  const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE));
  let fileId: string | null = null;
  let result: ChunkedUploadResult | null = null;

  try {
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const chunk = file.slice(start, start + CHUNK_SIZE);

      const formData = new FormData();
      formData.append("chunk", chunk, file.name);
      formData.append("chunkIndex", String(i));
      formData.append("totalChunks", String(totalChunks));
      formData.append("filename", file.name);
      formData.append("mimeType", file.type || "application/octet-stream");
      formData.append("type", options.type || "main");
      if (fileId) formData.append("fileId", fileId);

      const res = await fetch(`/api/contents/${slug}/files`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || `Upload failed (chunk ${i + 1}/${totalChunks})`);
      }

      fileId = json.data.id;
      result = json.data;
      options.onProgress?.(Math.round(((i + 1) / totalChunks) * 100));
    }

    if (!result) {
      throw new Error("Upload failed");
    }

    return result;
  } catch (error) {
    // Clean up the partial file record if the upload failed mid-way.
    // Only delete when the file wasn't finalized, to avoid removing a
    // fully-completed record if the final response was lost.
    if (fileId && (!result || result.url === "pending")) {
      try {
        await fetch(`/api/contents/${slug}/files?id=${fileId}`, {
          method: "DELETE",
        });
      } catch {
        // ignore cleanup failures - the partial record is harmless
      }
    }
    throw error;
  }
}
