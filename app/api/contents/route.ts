import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { getSession, requireAdmin, handleAuthError } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("q") || "";
    const type = searchParams.get("type") || "";
    const priceType = searchParams.get("priceType") || "";
    const sort = searchParams.get("sort") || "newest";
    const status = searchParams.get("status") || "";
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: "insensitive" };
    if (type) where.contentType = type;
    if (priceType) where.priceType = priceType;

    let orderBy: Record<string, any> = { createdAt: "desc" };
    if (sort === "popular") orderBy = { views: "desc" };
    if (sort === "trending") orderBy = { purchaseCount: "desc" };
    if (sort === "price_asc") orderBy = { discountPrice: { sort: "asc", nulls: "last" } };
    if (sort === "price_desc") orderBy = { discountPrice: { sort: "desc", nulls: "last" } };
    if (sort === "title") orderBy = { title: "asc" };

    const [contents, total] = await Promise.all([
      prisma.content.findMany({
        where: where as any,
        orderBy: orderBy as any,
        skip,
        take: limit,
        include: {
          tags: true,
          _count: { select: { reviews: true } },
        },
      }),
      prisma.content.count({ where: where as any }),
    ]);

    return NextResponse.json({
      success: true,
      data: contents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Contents fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch contents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const slug = body.slug || slugify(body.title);

    // Check if slug exists
    const existing = await prisma.content.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { message: "A content with this slug already exists" },
        { status: 409 }
      );
    }

    const { tags, ...contentData } = body;

    const content = await prisma.content.create({
      data: {
        ...contentData,
        slug,
        tags: {
          connectOrCreate: tags?.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag, slug: slugify(tag) },
          })) || [],
        },
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json({ success: true, data: content }, { status: 201 });
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError) {
      return NextResponse.json({ message: authError.message }, { status: authError.status });
    }
    console.error("Content create error:", error);
    return NextResponse.json(
      { message: "Failed to create content" },
      { status: 500 }
    );
  }
}
