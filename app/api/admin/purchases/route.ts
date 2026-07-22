import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleAuthError } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = {};
    if (status) where.paymentStatus = status;

    const skip = (page - 1) * limit;

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where: where as any,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          items: {
            include: {
              content: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  thumbnail: true,
                  contentType: true,
                },
              },
            },
          },
          invoice: true,
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
    const authError = handleAuthError(error);
    if (authError) {
      return NextResponse.json({ message: authError.message }, { status: authError.status });
    }
    console.error("Admin purchases fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}
