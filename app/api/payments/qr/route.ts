import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin, handleAuthError } from "@/lib/auth";

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

    if (purchase.userId !== session.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Snapshot the QR payment details shown to the buyer at payment time
    const settings = await prisma.setting.findMany({
      where: { key: { in: ["upi_id", "qr_receiver", "qr_image"] } },
    });
    const settingMap: Record<string, string> = {};
    for (const setting of settings) {
      settingMap[setting.key] = setting.value;
    }

    // Create QR payment record
    const qrPayment = await prisma.qRPayment.create({
      data: {
        purchaseId,
        userId: session.id,
        amount: purchase.finalAmount,
        transactionId,
        paymentNote,
        status: "PENDING",
        upiId: settingMap.upi_id || "admin@contenthub",
        receiverName: settingMap.qr_receiver || null,
        qrImage: settingMap.qr_image || null,
      },
    });

    // Update purchase status
    await prisma.purchase.update({
      where: { id: purchaseId },
      data: { paymentStatus: "PENDING" },
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

    const qrPayments = await prisma.qRPayment.findMany({
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
