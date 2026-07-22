import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken, setSessionCookie } from "@/lib/auth";
import { signupSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = signupSchema.parse(body);

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existing) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(validated.password);

    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        emailVerified: true, // Auto-verify for now
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      isOwnerAdmin: user.isOwnerAdmin,
    });

    const cookieStore = await cookies();
    const cookie = setSessionCookie(token, false);
    cookieStore.set(cookie);

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully!",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isOwnerAdmin: user.isOwnerAdmin,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { message: "Invalid input. Please check your details." },
        { status: 400 }
      );
    }
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
