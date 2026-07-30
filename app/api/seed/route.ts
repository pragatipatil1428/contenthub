import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

function getPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

async function runSeed(prisma: PrismaClient) {
  const adminEmail = process.env.ADMIN_EMAIL || "owner@contenthub.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
  const adminName = process.env.ADMIN_NAME || "Owner Admin";

  // Create Owner Admin
  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { isOwnerAdmin: true, emailVerified: true },
    create: {
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      isOwnerAdmin: true,
      emailVerified: true,
    },
  });

  // Create demo buyer user
  const buyerPassword = await bcrypt.hash("User@123", 12);
  await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "user@example.com",
      password: buyerPassword,
      isOwnerAdmin: false,
      emailVerified: true,
    },
  });

  // Create sample content
  const sampleContent = [
    {
      title: "Complete Web Development Course 2024",
      subtitle: "Learn Full-Stack Development from Scratch",
      slug: "complete-web-development-course",
      description: "A comprehensive web development course covering HTML, CSS, JavaScript, React, Node.js, and more.",
      contentType: "COURSE",
      status: "PUBLISHED" as const,
      priceType: "PAID" as const,
      originalPrice: 4999,
      discountPrice: 1999,
      currency: "INR",
      isFeatured: true,
      isTrending: true,
      isPopular: true,
      isNewArrival: true,
      views: 15420,
      downloads: 2340,
      rating: 4.8,
    },
    {
      title: "Premium Music Production Pack",
      subtitle: "Professional Sound Library",
      slug: "premium-music-production-pack",
      description: "High-quality music production samples, loops, and presets.",
      contentType: "AUDIO",
      status: "PUBLISHED" as const,
      priceType: "PAID" as const,
      originalPrice: 2999,
      discountPrice: 999,
      currency: "INR",
      isFeatured: true,
      views: 8920,
      downloads: 1560,
      rating: 4.6,
    },
    {
      title: "Free Ebook: JavaScript Fundamentals",
      subtitle: "Master JavaScript Basics",
      slug: "javascript-fundamentals-ebook",
      description: "A comprehensive guide to JavaScript fundamentals.",
      contentType: "EBOOK",
      status: "PUBLISHED" as const,
      priceType: "FREE" as const,
      isFeatured: true,
      views: 45200,
      downloads: 12300,
      rating: 4.7,
    },
    {
      title: "UI/UX Design Masterclass",
      subtitle: "Design Beautiful Interfaces",
      slug: "ui-ux-design-masterclass",
      description: "Learn UI/UX design principles from industry experts.",
      contentType: "COURSE",
      status: "PUBLISHED" as const,
      priceType: "PAID" as const,
      originalPrice: 3999,
      discountPrice: 1499,
      currency: "INR",
      views: 6780,
      downloads: 890,
      rating: 4.9,
    },
    {
      title: "Stocks Photos Bundle - Vol 1",
      subtitle: "100 High-Resolution Stock Images",
      slug: "stock-photos-bundle-vol1",
      description: "Professional stock photography collection.",
      contentType: "IMAGE",
      status: "PUBLISHED" as const,
      priceType: "FREE" as const,
      views: 28900,
      downloads: 8700,
      rating: 4.5,
    },
    {
      title: "React Native Mobile App Template",
      subtitle: "Ready-to-use Mobile App Starter",
      slug: "react-native-app-template",
      description: "A production-ready React Native template with authentication, navigation, payments, and more.",
      contentType: "TEMPLATE",
      status: "PUBLISHED" as const,
      priceType: "PAID" as const,
      originalPrice: 2499,
      discountPrice: 799,
      currency: "INR",
      views: 12300,
      downloads: 2400,
      rating: 4.4,
    },
  ];

  for (const content of sampleContent) {
    const { subtitle, ...contentData } = content;
    await prisma.content.upsert({
      where: { slug: contentData.slug },
      update: {},
      create: contentData,
    });
  }

  // Create sample settings
  const settings = [
    { key: "site_name", value: "ContentHub", type: "string" },
    { key: "payment_method", value: "QR_CODE", type: "string" },
    { key: "upi_id", value: "admin@contenthub", type: "string" },
    { key: "qr_receiver", value: "ContentHub Admin", type: "string" },
    { key: "currency", value: "INR", type: "string" },
    { key: "tax_percentage", value: "18", type: "number" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting as any,
    });
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.SEED_SECRET;
  if (!secret) {
    return NextResponse.json(
      { message: "SEED_SECRET environment variable is not configured on the server" },
      { status: 500 }
    );
  }

  const providedSecret = request.headers.get("x-seed-secret");
  if (!providedSecret || providedSecret !== secret) {
    return NextResponse.json(
      { message: "Invalid or missing x-seed-secret header" },
      { status: 401 }
    );
  }

  let prisma: PrismaClient | null = null;
  try {
    prisma = getPrismaClient();
    await runSeed(prisma);
    return NextResponse.json({ success: true, message: "Database seeded successfully" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { message: "Seed failed", error: String(error) },
      { status: 500 }
    );
  } finally {
    if (prisma) await prisma.$disconnect();
  }
}
