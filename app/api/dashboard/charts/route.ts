import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleAuthError } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    // Monthly revenue for last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyPurchases = await prisma.purchase.findMany({
      where: {
        createdAt: { gte: twelveMonthsAgo },
        paymentStatus: "APPROVED",
      },
      select: { createdAt: true, finalAmount: true },
      orderBy: { createdAt: "asc" },
    });

    // Group by month
    const monthlyData: Record<string, { revenue: number; count: number }> = {};
    for (let i = 0; i < 12; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] = { revenue: 0, count: 0 };
    }

    for (const purchase of monthlyPurchases) {
      const d = new Date(purchase.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyData[key]) {
        monthlyData[key].revenue += purchase.finalAmount;
        monthlyData[key].count += 1;
      }
    }

    // Category distribution
    const categoryData = await prisma.category.findMany({
      include: { _count: { select: { contents: true } } },
      orderBy: { name: "asc" },
    });

    // Recent purchases
    const recentPurchases = await prisma.purchase.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            content: { select: { id: true, title: true, slug: true } },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        revenue: Object.entries(monthlyData).map(([month, data]) => ({
          month,
          revenue: data.revenue,
          purchases: data.count,
        })),
        categories: categoryData.map((c) => ({
          name: c.name,
          count: c._count.contents,
        })),
        recentPurchases,
      },
    });
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError) {
      return NextResponse.json({ message: authError.message }, { status: authError.status });
    }
    console.error("Charts data error:", error);
    return NextResponse.json(
      { message: "Failed to fetch chart data" },
      { status: 500 }
    );
  }
}
