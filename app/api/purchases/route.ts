import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = { userId: session.userId };
    if (status) where.paymentStatus = status;

    const skip = (page - 1) * limit;

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where: where as any,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          items: {
            include: {
          content: {
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnail: true,
              contentType: true,
              priceType: true,
              description: true,
              files: {
                select: {
                  id: true,
                  filename: true,
                  url: true,
                  size: true,
                  mimeType: true,
                  type: true,
                },
                orderBy: { order: "asc" },
              },
              features: true,
            },
          },
            },
          },
          invoice: true,
          qrPayment: true,
        },
      }),
      prisma.purchase.count({ where: where as any }),
    ]);

    return NextResponse.json({
      success: true,
      data: purchases,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Purchases fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { contentId, paymentMethod = "QR_CODE" } = body;

    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      return NextResponse.json(
        { message: "Content not found" },
        { status: 404 }
      );
    }

    if (content.priceType === "FREE") {
      // Free content - create purchase immediately
      const purchase = await prisma.purchase.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: session.userId,
          totalAmount: 0,
          finalAmount: 0,
          paymentMethod: "QR_CODE",
          paymentStatus: "APPROVED",
          status: "COMPLETED",
          items: {
            create: {
              contentId: content.id,
              userId: session.userId,
              price: 0,
            },
          },
        },
        include: {
          items: {
            include: {
              content: { select: { id: true, title: true, slug: true } },
            },
          },
        },
      });

      // Create download record
      await prisma.download.create({
        data: {
          contentId: content.id,
          userId: session.userId,
          isFree: true,
        },
      });

      return NextResponse.json({ success: true, data: purchase });
    }

    // Paid content - create pending purchase
    const amount = content.discountPrice || content.originalPrice || 0;

    const purchase = await prisma.purchase.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.userId,
        totalAmount: amount,
        finalAmount: amount,
        paymentMethod,
        paymentStatus: "PENDING",
        status: "PENDING",
        items: {
          create: {
            contentId: content.id,
            userId: session.userId,
            price: amount,
          },
        },
      },
      include: {
        items: {
          include: {
            content: { select: { id: true, title: true, slug: true, thumbnail: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: purchase });
  } catch (error) {
    console.error("Purchase create error:", error);
    return NextResponse.json(
      { message: "Failed to create purchase" },
      { status: 500 }
    );
  }
}
