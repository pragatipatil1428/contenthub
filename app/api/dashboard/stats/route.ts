import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleAuthError } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalRevenue,
      todayPurchases,
      totalPurchases,
      pendingQrPayments,
      pendingPurchases,
      failedPurchases,
      totalContent,
      freeDownloads,
      paidDownloads,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.purchase.aggregate({
        _sum: { finalAmount: true },
        where: { paymentStatus: "APPROVED" },
      }),
      prisma.purchase.findMany({
        where: {
          createdAt: { gte: today },
          paymentStatus: "APPROVED",
        },
        select: { finalAmount: true },
      }),
      prisma.purchase.count({ where: { paymentStatus: "APPROVED" } }),
      // Count QR payments pending admin approval (these need admin action)
      prisma.qRPayment.count({ where: { status: "PENDING" } }),
      // Total purchases with PENDING payment status for info
      prisma.purchase.count({ where: { paymentStatus: "PENDING" } }),
      prisma.purchase.count({ where: { paymentStatus: "FAILED" } }),
      prisma.content.count(),
      prisma.download.count({ where: { isFree: true } }),
      prisma.download.count({ where: { isFree: false } }),
    ]);

    const todayRevenue = todayPurchases.reduce(
      (sum, p) => sum + p.finalAmount,
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalRevenue: totalRevenue._sum.finalAmount || 0,
        todayRevenue,
        totalPurchases,
        pendingPurchases: pendingQrPayments,
        totalPendingPurchases: pendingPurchases,
        failedPurchases,
        totalContent,
        freeDownloads,
        paidDownloads,
      },
    });
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError) {
      return NextResponse.json({ message: authError.message }, { status: authError.status });
    }
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
