"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname, useSearchParams } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  isActive: (pathname: string, searchParams: URLSearchParams) => boolean;
}

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Home",
    isActive: (pathname) => pathname === "/",
  },
  {
    href: "/contents",
    label: "Browse",
    isActive: (pathname, searchParams) =>
      pathname === "/contents" &&
      !searchParams.get("type") &&
      !searchParams.get("priceType"),
  },
  {
    href: "/contents?type=VIDEO",
    label: "Videos",
    isActive: (_, searchParams) => searchParams.get("type") === "VIDEO",
  },
  {
    href: "/contents?type=AUDIO",
    label: "Audio",
    isActive: (_, searchParams) => searchParams.get("type") === "AUDIO",
  },
  {
    href: "/contents?type=PDF",
    label: "PDFs",
    isActive: (_, searchParams) => searchParams.get("type") === "PDF",
  },
  {
    href: "/contents?type=COURSE",
    label: "Courses",
    isActive: (_, searchParams) => searchParams.get("type") === "COURSE",
  },
  {
    href: "/free",
    label: "Free",
    isActive: (pathname, searchParams) =>
      pathname === "/free" || searchParams.get("priceType") === "FREE",
  },
];

export function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <nav className="hidden lg:flex border-b border-zinc-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-2 sm:px-6 lg:px-8">
        {navItems.map((item) => {
          const active = item.isActive(pathname, searchParams);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                active
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
