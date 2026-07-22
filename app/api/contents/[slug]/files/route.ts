import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleAuthError } from "@/lib/auth";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch {
    // Directory already exists
  }
}

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

    await ensureUploadDir();

    // Generate unique filename
    const ext = file.name.split(".").pop() || "";
    const uniqueName = `${uuidv4()}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, uniqueName);
    const publicUrl = `/uploads/${uniqueName}`;

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Get the max order for this content
    const maxOrder = await prisma.contentFile.aggregate({
      where: { contentId: content.id },
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    // Create database record
    const contentFile = await prisma.contentFile.create({
      data: {
        contentId: content.id,
        filename: file.name,
        url: publicUrl,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
        type: fileType,
        order: fileOrder || nextOrder,
      },
    });

    return NextResponse.json({ success: true, data: contentFile }, { status: 201 });
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

    // Delete from database
    await prisma.contentFile.delete({ where: { id: fileId } });

    // Delete physical file from disk
    try {
      const filePath = path.join(process.cwd(), "public", file.url);
      await unlink(filePath);
    } catch {
      // File may already be deleted from disk, that's fine
    }

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
