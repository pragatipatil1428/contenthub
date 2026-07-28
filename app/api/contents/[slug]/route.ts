import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { getSession, requireAdmin, handleAuthError } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const content = await prisma.content.findUnique({
      where: { slug },
      include: {
        category: true,
        subCategory: true,
        tags: true,
        files: true,
        screenshots: true,
        features: true,
        requirements: true,
        reviews: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
        },
    _count: {
      select: {
        reviews: true,
        wishlists: true,
        bookmarks: true,
      },
    },
      },
    });

    if (!content) {
      return NextResponse.json(
        { message: "Content not found" },
        { status: 404 }
      );
    }

    // Increment views
    await prisma.content.update({
      where: { id: content.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ success: true, data: content });
  } catch (error) {
    console.error("Content fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requireAdmin();

    const { slug } = await params;
    const body = await request.json();
    const { tags, ...contentData } = body;

    const existing = await prisma.content.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json(
        { message: "Content not found" },
        { status: 404 }
      );
    }

    const content = await prisma.content.update({
      where: { slug },
      data: {
        ...contentData,
        tags: tags
          ? {
              set: [],
              connectOrCreate: tags.map((tag: string) => ({
                where: { name: tag },
                create: { name: tag, slug: slugify(tag) },
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        tags: true,
      },
    });

    return NextResponse.json({ success: true, data: content });
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError) {
      return NextResponse.json({ message: authError.message }, { status: authError.status });
    }
    console.error("Content update error:", error);
    return NextResponse.json(
      { message: "Failed to update content" },
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

    const existing = await prisma.content.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json(
        { message: "Content not found" },
        { status: 404 }
      );
    }

    // Check if content has any purchases
    const purchaseCount = await prisma.purchaseItem.count({
      where: { contentId: existing.id },
    });

    if (purchaseCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete "${existing.title}" — it has ${purchaseCount} purchase(s). Remove purchase records first or archive the content instead.`,
        },
        { status: 400 }
      );
    }

    await prisma.content.delete({ where: { slug } });

    return NextResponse.json({
      success: true,
      message: "Content deleted successfully",
    });
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError) {
      return NextResponse.json({ message: authError.message }, { status: authError.status });
    }
    console.error("Content delete error:", error);
    return NextResponse.json(
      { message: "Failed to delete content" },
      { status: 500 }
    );
  }
}
