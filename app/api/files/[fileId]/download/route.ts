import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STREAM_CHUNK_SIZE = 256 * 1024; // 256KB per streamed chunk

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;

    const file = await prisma.contentFile.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        filename: true,
        mimeType: true,
        size: true,
        fileData: true,
        url: true,
      },
    });

    if (!file || !file.fileData) {
      return NextResponse.json(
        { message: "File not found" },
        { status: 404 }
      );
    }

    const data = new Uint8Array(file.fileData);

    // Stream the response instead of returning one large body. Streaming
    // responses bypass Vercel's 4.5MB response size limit, so large files
    // (e.g. videos) can be downloaded without FUNCTION_PAYLOAD_TOO_LARGE.
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (let offset = 0; offset < data.length; offset += STREAM_CHUNK_SIZE) {
          controller.enqueue(data.slice(offset, offset + STREAM_CHUNK_SIZE));
        }
        controller.close();
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": file.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${file.filename}"`,
        "Content-Length": String(file.size || data.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("File download error:", error);
    return NextResponse.json(
      { message: "Failed to download file" },
      { status: 500 }
    );
  }
}
