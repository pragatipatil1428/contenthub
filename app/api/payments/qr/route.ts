import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireAuth, requireAdmin, handleAuthError } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { purchaseId, transactionId, paymentNote } = body;

    if (!purchaseId || !transactionId) {
      return NextResponse.json(
        { message: "Purchase ID and Transaction ID are required" },
        { status: 400 }
      );
    }

    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: { items: true },
    });

    if (!purchase) {
      return NextResponse.json(
        { message: "Purchase not found" },
        { status: 404 }
      );
    }

    if (purchase.userId !== session.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Create QR payment record
    const qrPayment = await prisma.qrPayment.create({
      data: {
        purchaseId,
        userId: session.userId,
        amount: purchase.finalAmount,
        transactionId,
        paymentNote,
        status: "PENDING",
      },
    });

    // Update purchase status
    await prisma.purchase.update({
      where: { id: purchaseId },
      data: { paymentStatus: "PENDING" },
    });

    // Create notification for admin
    await prisma.notification.create({
      data: {
        title: "New Payment Pending",
        message: `Payment of ₹${purchase.finalAmount} is pending approval. Transaction ID: ${transactionId}`,
        type: "PAYMENT_PENDING",
        link: `/admin/payments`,
      },
    });

    return NextResponse.json({ success: true, data: qrPayment });
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError) {
      return NextResponse.json({ message: authError.message }, { status: authError.status });
    }
    console.error("QR payment error:", error);
    return NextResponse.json(
      { message: "Failed to process payment" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await requireAdmin();

    const qrPayments = await prisma.qrPayment.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        purchase: {
          include: {
            items: {
              include: {
                content: { select: { id: true, title: true, slug: true } },
              },
            },
          },
        },
        user: { select: { id: true, name: true, email: true } },
        screenshots: true,
      },
    });

    return NextResponse.json({ success: true, data: qrPayments });
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError) {
      return NextResponse.json({ message: authError.message }, { status: authError.status });
    }
    console.error("QR payments fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
