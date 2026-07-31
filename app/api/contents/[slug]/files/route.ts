import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleAuthError } from "@/lib/auth";

const MAX_UPLOAD_SIZE = 200 * 1024 * 1024; // 200MB
const MAX_CHUNK_SIZE = 4.5 * 1024 * 1024; // 4.5MB — Vercel function request body limit

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const content = await prisma.content.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!content) {
      return NextResponse.json(
        { message: "Content not found" },
        { status: 404 }
      );
    }

    const files = await prisma.contentFile.findMany({
      where: { contentId: content.id },
      orderBy: { order: "asc" },
      select: {
        id: true,
        contentId: true,
        filename: true,
        url: true,
        size: true,
        mimeType: true,
        type: true,
        order: true,
        // NOTE: fileData is NOT selected here - it's only fetched on explicit download
      },
    });

    return NextResponse.json({ success: true, data: files });
  } catch (error) {
    console.error("Files fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch files" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requireAdmin();

    const { slug } = await params;

    const content = await prisma.content.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!content) {
      return NextResponse.json(
        { message: "Content not found" },
        { status: 404 }
      );
    }

    // Chunked upload: the client sends the file in small pieces (under 4.5MB)
    // to stay within Vercel's serverless function request body limit. Each
    // chunk is appended to the fileData bytes stored in the database.
    const formData = await request.formData();
    const chunk = formData.get("chunk") as File | null;
    const chunkIndex = parseInt(formData.get("chunkIndex") as string) || 0;
    const totalChunks = parseInt(formData.get("totalChunks") as string) || 1;
    const filename = (formData.get("filename") as string) || "file";
    const mimeType = (formData.get("mimeType") as string) || "application/octet-stream";
    const type = (formData.get("type") as string) || "main";
    const fileId = (formData.get("fileId") as string) || null;

    if (!chunk || chunk.size === 0) {
      return NextResponse.json(
        { message: "No file chunk provided" },
        { status: 400 }
      );
    }

    if (chunk.size > MAX_CHUNK_SIZE) {
      return NextResponse.json(
        { message: "Chunk too large" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await chunk.arrayBuffer());

    // First chunk: create the record. Subsequent chunks: append to it.
    let contentFile;
    if (chunkIndex === 0) {
      // Get the max order for this content
      const maxOrder = await prisma.contentFile.aggregate({
        where: { contentId: content.id },
        _max: { order: true },
      });
      const nextOrder = (maxOrder._max.order ?? -1) + 1;

      contentFile = await prisma.contentFile.create({
        data: {
          contentId: content.id,
          filename,
          url: "pending",
          size: buffer.length,
          mimeType,
          type,
          order: nextOrder,
          fileData: buffer,
        },
      });
    } else {
      if (!fileId) {
        return NextResponse.json(
          { message: "Missing fileId for continuation chunk" },
          { status: 400 }
        );
      }

      const existing = await prisma.contentFile.findFirst({
        where: { id: fileId, contentId: content.id },
      });
      if (!existing) {
        return NextResponse.json(
          { message: "File not found" },
          { status: 404 }
        );
      }

      const combined = Buffer.concat([
        Buffer.from(existing.fileData || Buffer.alloc(0)),
        buffer,
      ]);

      if (combined.length > MAX_UPLOAD_SIZE) {
        return NextResponse.json(
          { message: "File too large. Maximum size is 200MB" },
          { status: 400 }
        );
      }

      contentFile = await prisma.contentFile.update({
        where: { id: existing.id },
        data: {
          fileData: combined,
          size: combined.length,
        },
      });
    }

    // Final chunk: finalize the download URL
    if (chunkIndex >= totalChunks - 1) {
      contentFile = await prisma.contentFile.update({
        where: { id: contentFile.id },
        data: { url: `/api/files/${contentFile.id}/download` },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: contentFile.id,
          contentId: contentFile.contentId,
          filename: contentFile.filename,
          url: contentFile.url,
          size: contentFile.size,
          mimeType: contentFile.mimeType,
          type: contentFile.type,
          order: contentFile.order,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError) {
      return NextResponse.json({ message: authError.message }, { status: authError.status });
    }
    console.error("File upload error:", error);
    return NextResponse.json(
      { message: "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requireAdmin();

    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get("id");

    if (!fileId) {
      return NextResponse.json(
        { message: "File ID is required" },
        { status: 400 }
      );
    }

    const content = await prisma.content.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!content) {
      return NextResponse.json(
        { message: "Content not found" },
        { status: 404 }
      );
    }

    const file = await prisma.contentFile.findFirst({
      where: { id: fileId, contentId: content.id },
    });

    if (!file) {
      return NextResponse.json(
        { message: "File not found" },
        { status: 404 }
      );
    }

    // Delete from database (fileData is also removed automatically)
    await prisma.contentFile.delete({ where: { id: fileId } });

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError) {
      return NextResponse.json({ message: authError.message }, { status: authError.status });
    }
    console.error("File delete error:", error);
    return NextResponse.json(
      { message: "Failed to delete file" },
      { status: 500 }
    );
  }
}
