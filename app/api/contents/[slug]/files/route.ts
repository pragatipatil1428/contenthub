import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleAuthError } from "@/lib/auth";

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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fileType = (formData.get("type") as string) || "main";
    const fileOrder = parseInt(formData.get("order") as string) || 0;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: "File too large. Maximum size is 50MB" },
        { status: 400 }
      );
    }

    // Get the max order for this content
    const maxOrder = await prisma.contentFile.aggregate({
      where: { contentId: content.id },
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create database record with file data stored in DB
    const contentFile = await prisma.contentFile.create({
      data: {
        contentId: content.id,
        filename: file.name,
        url: "pending", // Will be updated with actual file ID
        size: file.size,
        mimeType: file.type || "application/octet-stream",
        type: fileType,
        order: fileOrder || nextOrder,
        fileData: buffer, // Store binary data in database
      },
    });

    // Update URL with the actual file ID
    const finalFile = await prisma.contentFile.update({
      where: { id: contentFile.id },
      data: { url: `/api/files/${contentFile.id}/download` },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: finalFile.id,
          contentId: finalFile.contentId,
          filename: finalFile.filename,
          url: finalFile.url,
          size: finalFile.size,
          mimeType: finalFile.mimeType,
          type: finalFile.type,
          order: finalFile.order,
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
