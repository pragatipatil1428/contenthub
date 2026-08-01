import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleAuthError } from "@/lib/auth";

// Keys that admins are allowed to update
const ALLOWED_KEYS = [
  "site_name",
  "payment_method",
  "upi_id",
  "qr_receiver",
  "qr_image",
  "currency",
  "tax_percentage",
];

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const data: Record<string, string> = {};
    for (const setting of settings) {
      data[setting.key] = setting.value;
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { message: "Invalid settings payload" },
        { status: 400 }
      );
    }

    const entries = Object.entries(body as Record<string, unknown>).filter(
      ([key]) => ALLOWED_KEYS.includes(key)
    );

    for (const [key, value] of entries) {
      if (typeof value !== "string") continue;
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value, type: "string" },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
    });
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError) {
      return NextResponse.json(
        { message: authError.message },
        { status: authError.status }
      );
    }
    console.error("Settings save error:", error);
    return NextResponse.json(
      { message: "Failed to save settings" },
      { status: 500 }
    );
  }
}
