import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  const cookie = clearSessionCookie();
  cookieStore.set(cookie);

  return NextResponse.json({ success: true, message: "Logged out successfully" });
}
