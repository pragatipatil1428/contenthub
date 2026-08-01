import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleAuthError } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { action, adminNote } = body;

    const qrPayment = await prisma.qRPayment.findUnique({
      where: { id },
      include: { purchase: true },
    });

    if (!qrPayment) {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      // Approve payment
      await prisma.qRPayment.update({
        where: { id },
        data: {
          status: "APPROVED",
          adminNote,
          approvedAt: new Date(),
        },
      });

      await prisma.purchase.update({
        where: { id: qrPayment.purchaseId },
        data: {
          paymentStatus: "APPROVED",
          status: "COMPLETED",
        },
      });

      // Give user access by creating download records
      const purchaseItems = await prisma.purchaseItem.findMany({
        where: { purchaseId: qrPayment.purchaseId },
      });

      for (const item of purchaseItems) {
        await prisma.download.create({
          data: {
            contentId: item.contentId,
            userId: qrPayment.userId,
            isFree: false,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Payment approved successfully",
      });
    } else if (action === "reject") {
      await prisma.qRPayment.update({
        where: { id },
        data: { status: "REJECTED", adminNote, rejectedAt: new Date() },
      });

      await prisma.purchase.update({
        where: { id: qrPayment.purchaseId },
        data: { paymentStatus: "REJECTED", status: "FAILED" },
      });

      return NextResponse.json({
        success: true,
        message: "Payment rejected",
      });
    } else {
      return NextResponse.json(
        { message: "Invalid action. Use 'approve' or 'reject'" },
        { status: 400 }
      );
    }
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError) {
      return NextResponse.json({ message: authError.message }, { status: authError.status });
    }
    console.error("Payment update error:", error);
    return NextResponse.json(
      { message: "Failed to update payment" },
      { status: 500 }
    );
  }
}
