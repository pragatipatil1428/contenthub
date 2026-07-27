import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const purchase = await prisma.purchase.findUnique({
      where: { id },
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
    });

    if (!purchase) {
      return NextResponse.json(
        { success: false, message: "Purchase not found" },
        { status: 404 }
      );
    }

    // Allow access if the user is the purchase owner OR is an admin
    const isOwner = purchase.userId === session.userId;
    const isAdmin = session.isOwnerAdmin === true;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ success: true, data: purchase });
  } catch (error) {
    console.error("Purchase fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch purchase" },
      { status: 500 }
    );
  }
}
