import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      },
    });

    if (!file || !file.fileData) {
      return NextResponse.json(
        { message: "File not found" },
        { status: 404 }
      );
    }

    // Convert the Bytes (Buffer) to a Uint8Array for the response
    const data = new Uint8Array(file.fileData);

    // Return the file with appropriate headers
    return new NextResponse(data, {
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
